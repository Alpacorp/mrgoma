import React from 'react';
import { TiresData } from '@/app/interfaces/tires';
import Image from 'next/image';

const CardTest: React.FC<TiresData> = ({
  TireId,
  Code,
  Size,
  VaultName,
  Brand,
  Status,
  Location,
  Description,
  Image1,
  Price,
}) => {
  const defaultImage = 'https://mrgomatires.com/images/notavailable.jpg';
  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-md p-4 m-2 w-64">
      <div className="mb-4">
        <Image
          src={Image1 ?? defaultImage}
          alt={`Image of ${TireId}`}
          className="w-full h-48 object-cover rounded-lg"
          width={300}
          height={200}
          priority
        />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">{TireId}</h2>
        <p>
          <strong>Code:</strong> {Code}
        </p>
        <p>
          <strong>Size:</strong> {Size}
        </p>
        <p>
          <strong>Vault:</strong> {VaultName}
        </p>
        <p>
          <strong>Brand:</strong> {Brand}
        </p>
        <p>
          <strong>Status:</strong> {Status}
        </p>
        <p>
          <strong>Location:</strong> {Location}
        </p>
        <p className="mt-2">
          <strong>Description:</strong> {Description}
        </p>
        <p>
          <strong>Price:</strong> {Price}
        </p>
      </div>
    </div>
  );
};

export default CardTest;
