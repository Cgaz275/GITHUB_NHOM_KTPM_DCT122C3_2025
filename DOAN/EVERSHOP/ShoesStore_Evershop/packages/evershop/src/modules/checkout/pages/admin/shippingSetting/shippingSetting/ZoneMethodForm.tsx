import { Card } from '@components/admin/Card.js';
import Spinner from '@components/admin/Spinner.js';
import Button from '@components/common/Button.js';
import { Form, useFormContext } from '@components/common/form/Form.js';
import { InputField } from '@components/common/form/InputField.js';
import { NumberField } from '@components/common/form/NumberField.js';
import { RadioGroupField } from '@components/common/form/RadioGroupField.js';
import { ReactSelectField } from '@components/common/form/ReactSelectField.js';
import { ToggleField } from '@components/common/form/ToggleField.js';
import { UrlField } from '@components/common/form/UrlField.js';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useQuery } from 'urql';
import { ShippingMethod } from './Method.js';
import { PriceBasedPrice } from './PriceBasedPrice.js';
import { WeightBasedPrice } from './WeightBasedPrice.js';

const AvailableMethodsQuery = `
  query AvailableMethods {
    shippingMethods {
      value: uuid
      label: name
    }
  }
`;

export interface ZoneConditionProps {
  method?: ShippingMethod;
}

function ZoneCondition({ method }: ZoneConditionProps) {
  const { watch, setValue } = useFormContext();
  const type = watch('condition_type', method?.conditionType || 'price');

  useEffect(() => {
    setValue('condition_type', method?.conditionType || 'price');
  }, [method]);

  return (
    <div>
      <div className="mb-2">
        <RadioGroupField
          name="condition_type"
          options={[
            { value: 'price', label: 'Based on order price' },
            { value: 'weight', label: 'Based on order weight' }
          ]}
          defaultValue={type}
        />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <NumberField
            name="min"
            label={
              type === 'price' ? 'Minimum order price' : 'Minimum order weight'
            }
            placeholder={
              type === 'price' ? 'Minimum order price' : 'Minimum order weight'
            }
            defaultValue={method?.min}
            required
            validation={{ required: 'Min is required' }}
            helperText="This is the minimum order price or weight to apply this condition."
          />
        </div>
        <div>
          <NumberField
            name="max"
            label={
              type === 'price' ? 'Maximum order price' : 'Maximum order weight'
            }
            placeholder={
              type === 'price' ? 'Maximum order price' : 'Maximum order weight'
            }
            defaultValue={method?.max}
            validation={{ required: 'Max is required' }}
            helperText="This is the maximum order price or weight to apply this condition."
          />
        </div>
      </div>
    </div>
  );
}

const getType = (method: ShippingMethod | null) => {
  if (method?.calculateApi) {
    return 'api';
  }
  if (method?.priceBasedCost) {
    return 'price_based_rate';
  }
  if (method?.weightBasedCost) {
    return 'weight_based_rate';
  }
  return 'flat_rate';
};

export interface ZoneMethodFormProps {
  zoneId: string;
  saveMethodApi: string;
  onSuccess: () => void;
  reload: () => void;
  method?: ShippingMethod;
}

const ZoneCostSetting: React.FC<{
  method: ShippingMethod | null;
}> = ({ method }) => {
  const { watch } = useFormContext();
  const typeWatch = watch('calculation_type');
  return (
    <>
      {typeWatch === 'flat_rate' && (
        <NumberField
          label="Flat rate cost"
          name="cost"
          placeholder="Shipping cost"
          required
          validation={{ required: 'Shipping cost is required' }}
          helperText="This is the flat rate cost for shipping."
          defaultValue={method?.cost?.value}
        />
      )}
      {typeWatch === 'price_based_rate' && (
        <PriceBasedPrice lines={method?.priceBasedCost || []} />
      )}
      {typeWatch === 'weight_based_rate' && (
        <WeightBasedPrice lines={method?.weightBasedCost || []} />
      )}
      {typeWatch === 'api' && (
        <UrlField
          name="calculate_api"
          placeholder="Calculate API endpoint"
          required
          validation={{ required: 'Calculate API is required' }}
          defaultValue={method?.calculateApi || ''}
          helperText="This API will be called to calculate shipping cost. It supposed to return a number."
        />
      )}
    </>
  );
};

function ZoneMethodForm({
  zoneId,
  saveMethodApi,
  onSuccess,
  reload,
  method
}: ZoneMethodFormProps) {
  const form = useForm({
    shouldUnregister: true
  });
  const [hasCondition, setHasCondition] = React.useState(
    !!method?.conditionType
  );

  const [result, reexecuteQuery] = useQuery({
    query: AvailableMethodsQuery
  });

  if (result.fetching) {
    return (
      <div className="flex justify-center p-2">
        <Spinner width={25} height={25} />
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="text-critical">
        Error loading available shipping methods
      </div>
    );
  }

  return (
    <Form
      id="zoneMethodForm"
      method={method ? 'PATCH' : 'POST'}
      action={saveMethodApi}
      submitBtn={false}
      onSuccess={async (response) => {
        if (!response.error) {
          reload();
          onSuccess && onSuccess();
          toast.success('Shipping method saved successfully');
        } else {
          toast.error(response.error.message);
        }
      }}
      form={form}
    >
      <Card.Session title="Select Method">
        {!method ? (
          <>
            <ReactSelectField
              name="method_id"
              options={result.data.shippingMethods}
              hideSelectedOptions={false}
              isMulti={false}
              required
              validation={{ required: 'Shipping method is required' }}
              placeholder="Select a shipping method"
            />
            <p className="text-gray-600 text-sm mt-2">
              Choose an existing shipping method to add to this zone.
            </p>
          </>
        ) : (
          <>
            <div className="p-3 bg-gray-100 rounded border border-gray-300">
              <p className="font-medium">{method.name}</p>
              <p className="text-sm text-gray-600">Method is locked while editing</p>
            </div>
            <InputField
              type="hidden"
              name="method_id"
              value={method?.uuid || ''}
            />
          </>
        )}
      </Card.Session>

      <Card.Session title="Setup shipping cost">
        <RadioGroupField
          name="calculation_type"
          options={[
            { label: 'Flat rate', value: 'flat_rate' },
            { label: 'Price based rate', value: 'price_based_rate' },
            { label: 'Weight based rate', value: 'weight_based_rate' },
            { label: 'API calculate', value: 'api' }
          ]}
          defaultValue={getType(method || null)}
        />

        <ZoneCostSetting method={method || null} />

        <a
          href="#"
          className="text-interactive"
          onClick={(e) => {
            e.preventDefault();
            setHasCondition(!hasCondition);
          }}
        >
          {hasCondition ? 'Remove condition' : 'Add condition'}
        </a>
        {!hasCondition && (
          <InputField name="condition_type" type="hidden" value="none" />
        )}
        {hasCondition && <ZoneCondition method={method} />}
      </Card.Session>

      <Card.Session>
        <ToggleField
          name="is_enabled"
          label="Status"
          defaultValue={method?.isEnabled || 1}
        />
      </Card.Session>

      <Card.Session>
        <div className="flex justify-end gap-2">
          <Button
            title="Save"
            variant="primary"
            type="submit"
          />
        </div>
      </Card.Session>
    </Form>
  );
}

export { ZoneMethodForm };
