
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

const NotFound = () => {
  return (
    <Layout>
      <div className="container flex flex-col items-center justify-center py-20 text-center">
        <div className="relative mb-8 text-primary">
          <div className="text-9xl font-bold opacity-10">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl font-bold">404</div>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
