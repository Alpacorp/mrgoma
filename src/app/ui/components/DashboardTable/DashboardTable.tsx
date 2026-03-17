'use client';
import { useRef, useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import DT, { AjaxData, AjaxResponse } from 'datatables.net-dt';
import DataTable, { DataTableRef } from 'datatables.net-react';
import Responsive from 'datatables.net-responsive-dt';

import { useCart } from '@/app/context/CartContext';

if (typeof window !== 'undefined') {
  DataTable.use(DT);
  DataTable.use(Responsive);
}

const esc = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const DashboardTable = () => {
  const tableRef = useRef<DataTableRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const { addToCart } = useCart();
  const addToCartRef = useRef(addToCart);

  useEffect(() => {
    addToCartRef.current = addToCart;
  });

  // Event delegation: handle clicks on add-to-cart buttons rendered inside DataTables
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = async (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('[data-add-cart]') as HTMLButtonElement | null;
      if (!btn || btn.disabled) return;

      const tireId = btn.dataset.tireId ?? '';
      const brand = btn.dataset.brand ?? '';
      const model = btn.dataset.model ?? '';
      const size = btn.dataset.size ?? '';
      const store = btn.dataset.store ?? '';

      const nameParts = [brand, model, size].filter(Boolean);
      const name = nameParts.join(' | ') || `Tire #${tireId}`;

      btn.disabled = true;
      btn.style.opacity = '0.5';

      try {
        const res = await fetch(`/api/tire?productId=${encodeURIComponent(tireId)}`);
        const data = res.ok ? await res.json() : null;

        const priceRaw = data?.price;
        const price = typeof priceRaw === 'string' ? parseFloat(priceRaw) || 0 : Number(priceRaw) || 0;

        addToCartRef.current({
          id: tireId,
          name,
          price,
          brand,
          condition: store ? `Store: ${store}` : undefined,
          images: data?.images,
        });
      } catch {
        addToCartRef.current({ id: tireId, name, price: 0, brand });
      }

      btn.disabled = false;
      btn.style.opacity = '';
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.dt()?.ajax.reload();
    }
  }, [searchParams]);

  return (
    <div ref={containerRef}>
      <DataTable
        ref={tableRef}
        ajax={(data: any, callback: any) => {
          const d = data as AjaxData;
          const cb = callback as (response: AjaxResponse) => void;
          (async () => {
            try {
              const params = new URLSearchParams(window.location.search);
              const currentPage = Math.floor(d.start / d.length) + 1;

              params.set('page', currentPage.toString());
              params.set('pageSize', d.length.toString());

              const response = await fetch(`/api/dashboard/tires?${params.toString()}`, {
                credentials: "include"
              });

              const result = await response.json();

              const order = d.order?.[0];

              if (order) {
                const columnIndex = order.column;
                const direction = order.dir;

                const columnName = d.columns[columnIndex].data;

                result?.records?.sort((a: any, b: any) => {
                  if (a[columnName] < b[columnName]) return direction === 'asc' ? -1 : 1;
                  if (a[columnName] > b[columnName]) return direction === 'asc' ? 1 : -1;
                  return 0;
                });
              }

              cb({
                draw: d.draw,
                data: result.records || [],
                recordsTotal: result.totalCount || 0,
                recordsFiltered: result.totalCount || 0,
              });
            } catch (error) {
              console.error('Error en fetch:', error);
            }
          })();
        }}
        className="display"
        options={{
          responsive: true,
          processing: true,
          searching: false,
          serverSide: true,
          autoWidth: true,
          columnDefs: [
            {
              targets: '_all',
              className: 'dt-left',
            },
          ],
          columns: [
            { data: 'TireId' },
            { data: 'Brand' },
            { data: 'VaultName' },
            { data: 'Model2' },
            { data: 'Height' },
            { data: 'Width' },
            { data: 'Size' },
            { data: 'LoadIndexId' },
            { data: 'Patched' },
            { data: 'Tread' },
            { data: 'DOT' },
            {
              data: 'Price',
              orderable: true,
              render: (data: any) => {
                if (data == null || data === '' || data === 0) return '-';
                const n = parseFloat(data);
                return isNaN(n) ? '-' : `$${n.toFixed(2)}`;
              },
            },
            {
              data: null,
              orderable: false,
              searchable: false,
              render: (_: any, __: any, row: any) => {
                const size = `${row.Height ?? ''}/${row.Width ?? ''}R${row.Size ?? ''}`;
                return `<button
                  title="Add to cart"
                  data-add-cart
                  data-tire-id="${esc(String(row.TireId ?? ''))}"
                  data-brand="${esc(String(row.Brand ?? ''))}"
                  data-model="${esc(String(row.Model2 ?? ''))}"
                  data-size="${esc(size)}"
                  data-store="${esc(String(row.VaultName ?? ''))}"
                  class="add-to-cart-btn inline-flex items-center justify-center bg-green-600 hover:bg-green-700 active:bg-green-800 text-white p-1.5 rounded-md cursor-pointer transition-colors"
                ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><polyline points="1 1 5 1 7.68 14.39 4.4 16.5 15.66 16.5 17.5 7 7 7"/></svg></button>`;
              },
            },
          ],
        }}
      >
        <thead>
          <tr>
            <th data-order="1500">ID</th>
            <th data-order="1500">Brand</th>
            <th data-order="1500">Store</th>
            <th data-order="1500">Model</th>
            <th data-order="1500">Width</th>
            <th data-order="1500">Sidewall</th>
            <th data-order="1500">Diameter</th>
            <th data-order="1500">Load</th>
            <th data-order="1500">Patched</th>
            <th data-order="1500">Tread</th>
            <th data-order="1500">DOT</th>
            <th data-order="1500">Price</th>
            <th></th>
          </tr>
        </thead>
      </DataTable>
    </div>
  );
};

export default DashboardTable;
