'use client';

import { useCallback, useEffect, useState } from 'react';

// Definimos la interfaz para las opciones de dimensiones
export interface DimensionOption {
  id: number;
  name: number;
}

// Hook para manejar la carga de dimensiones de neumáticos
export const useTireDimensions = () => {
  // Estados para almacenar las opciones de cada dimensión
  const [widthOptions, setWidthOptions] = useState<DimensionOption[]>([]);
  const [sidewallOptions, setSidewallOptions] = useState<DimensionOption[]>([]);
  const [diameterOptions, setDiameterOptions] = useState<DimensionOption[]>([]);

  // Estados para controlar la carga
  const [isLoadingWidth, setIsLoadingWidth] = useState(true);
  const [isLoadingSidewall, setIsLoadingSidewall] = useState(false);
  const [isLoadingDiameter, setIsLoadingDiameter] = useState(false);

  // Estados para los valores seleccionados
  const [selectedWidth, setSelectedWidth] = useState<string>('');
  const [selectedSidewall, setSelectedSidewall] = useState<string>('');
  const [selectedDiameter, setSelectedDiameter] = useState<string>('');

  // Función para cargar las opciones de width (Height en la BD)
  const loadWidthOptions = useCallback(async () => {
    setIsLoadingWidth(true);
    try {
      const response = await fetch('/api/dimensions/heights');
      if (!response.ok) throw new Error('Failed to fetch width options');
      const data = await response.json();
      setWidthOptions(data);
    } catch (error) {
      console.error('Error loading width options:', error);
      setWidthOptions([]);
    } finally {
      setIsLoadingWidth(false);
    }
  }, []);

  // Función para cargar las opciones de sidewall (Width en la BD)
  const loadSidewallOptions = useCallback(async (width: string) => {
    if (!width) {
      setSidewallOptions([]);
      return;
    }

    setIsLoadingSidewall(true);
    try {
      console.log('Fetching sidewall options for width:', width); // Debugging
      const response = await fetch(`/api/dimensions/widths?height=${encodeURIComponent(width)}`);
      if (!response.ok) throw new Error('Failed to fetch sidewall options');
      const data = await response.json();
      console.log('Sidewall options received:', data); // Debugging
      setSidewallOptions(data);
    } catch (error) {
      console.error('Error loading sidewall options:', error);
      setSidewallOptions([]);
    } finally {
      setIsLoadingSidewall(false);
    }
  }, []);

  // Función para cargar las opciones de diameter (Size en la BD)
  const loadDiameterOptions = useCallback(async (width: string, sidewall: string) => {
    if (!width || !sidewall) {
      setDiameterOptions([]);
      return;
    }

    setIsLoadingDiameter(true);
    try {
      console.log('Fetching diameter options for width:', width, 'sidewall:', sidewall);
      const url = `/api/dimensions/sizes?height=${encodeURIComponent(width)}&width=${encodeURIComponent(sidewall)}`;
      console.log('Request URL:', url);

      const response = await fetch(url);
      if (!response.ok) {
        console.error('Error response status:', response.status);
        throw new Error('Failed to fetch diameter options');
      }

      const data = await response.json();
      console.log('Diameter options received:', data);
      setDiameterOptions(data);
    } catch (error) {
      console.error('Error loading diameter options:', error);
      setDiameterOptions([]);
    } finally {
      setIsLoadingDiameter(false);
    }
  }, []);

  // Función para manejar el cambio de width
  const handleWidthChange = useCallback(
    (value: string) => {
      console.log('Width changed to:', value); // Debugging
      setSelectedWidth(value);
      setSelectedSidewall('');
      setSelectedDiameter('');
      loadSidewallOptions(value);
    },
    [loadSidewallOptions]
  );

  // Función para manejar el cambio de sidewall
  const handleSidewallChange = useCallback(
    (value: string) => {
      console.log('Sidewall changed to:', value); // Debugging
      setSelectedSidewall(value);
      setSelectedDiameter('');
      loadDiameterOptions(selectedWidth, value);
    },
    [loadDiameterOptions, selectedWidth]
  );

  // Función para manejar el cambio de diameter
  const handleDiameterChange = useCallback((value: string) => {
    console.log('Diameter changed to:', value); // Debugging
    setSelectedDiameter(value);
  }, []);

  // Cargar opciones iniciales de width al montar el componente
  useEffect(() => {
    loadWidthOptions();
  }, [loadWidthOptions]);

  return {
    widthOptions,
    sidewallOptions,
    diameterOptions,
    selectedWidth,
    selectedSidewall,
    selectedDiameter,
    isLoadingWidth,
    isLoadingSidewall,
    isLoadingDiameter,
    handleWidthChange,
    handleSidewallChange,
    handleDiameterChange,
    setSelectedWidth,
    setSelectedSidewall,
    setSelectedDiameter,
  };
};
