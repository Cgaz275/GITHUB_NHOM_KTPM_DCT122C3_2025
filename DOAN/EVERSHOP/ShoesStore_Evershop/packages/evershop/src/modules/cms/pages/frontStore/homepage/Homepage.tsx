import Area from '@components/common/Area.js';
import React from 'react';

interface HomePageData {
  storeName?: string;
}

interface HomePageProps {
  homepage: HomePageData;
}

export default function Homepage({ homepage }: HomePageProps) {
  return (
    <div className="page-width">
      <Area id="homepageTop" />
      <div className="homepage-content">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to {homepage?.storeName || 'EverShop'}
        </h1>
        <Area id="homepageContent" />
      </div>
      <Area id="homepageBottom" />
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    homepage {
      storeName
    }
  }
`;
