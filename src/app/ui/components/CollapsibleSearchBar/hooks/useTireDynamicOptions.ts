'use client';

import { useCallback, useEffect, useState } from 'react';

import { TireFilters } from './useTireSearch';

// Definimos la interfaz para las opciones de dimensiones
export interface DimensionOption {
  id: number;
  name: string | number;
}

// Hook para manejar la carga de dimensiones de neumáticos
export const useTireDynamicOptions = (selectedFilters: TireFilters) => {
  // Estados para almacenar las opciones de cada dimensión
  const [widthOptions, setWidthOptions] = useState<DimensionOption[]>([]);
  const [sidewallOptions, setSidewallOptions] = useState<DimensionOption[]>([]);
  const [diameterOptions, setDiameterOptions] = useState<DimensionOption[]>([]);

  // Estados para controlar la carga
  const [isLoadingWidth, setIsLoadingWidth] = useState(true);
  const [isLoadingSidewall, setIsLoadingSidewall] = useState(false);
  const [isLoadingDiameter, setIsLoadingDiameter] = useState(false);

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
      const response = await fetch(`/api/dimensions/widths?height=${encodeURIComponent(width)}`);
      if (!response.ok) throw new Error('Failed to fetch sidewall options');
      const data = await response.json();
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
      const url = `/api/dimensions/sizes?height=${encodeURIComponent(width)}&width=${encodeURIComponent(sidewall)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch diameter options');
      }

      const data = await response.json();
      setDiameterOptions(data);
    } catch (error) {
      console.error('Error loading diameter options:', error);
      setDiameterOptions([]);
    } finally {
      setIsLoadingDiameter(false);
    }
  }, []);

  // Cargar opciones iniciales de width al montar el componente
  useEffect(() => {
    loadWidthOptions();
  }, [loadWidthOptions]);

  // Actualizar las opciones de sidewall cuando cambie el width
  useEffect(() => {
    if (selectedFilters.w) {
      loadSidewallOptions(selectedFilters.w);
    } else {
      setSidewallOptions([]);
    }
  }, [selectedFilters.w, loadSidewallOptions]);

  // Actualizar las opciones de diameter cuando cambien width o sidewall
  useEffect(() => {
    if (selectedFilters.w && selectedFilters.s) {
      loadDiameterOptions(selectedFilters.w, selectedFilters.s);
    } else {
      setDiameterOptions([]);
    }
  }, [selectedFilters.w, selectedFilters.s, loadDiameterOptions]);

  return {
    widthOptions,
    sidewallOptions,
    diameterOptions,
    isLoadingWidth,
    isLoadingSidewall,
    isLoadingDiameter,
  };
};
