'use client';
import { useRef, useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import DT, { AjaxData, AjaxResponse } from 'datatables.net-dt';
import DataTable, { DataTableRef } from 'datatables.net-react';
import Responsive from 'datatables.net-responsive-dt';

if (typeof window !== 'undefined') {
  DataTable.use(DT);
  DataTable.use(Responsive);
}

const DashboardTable = () => {
  const tableRef = useRef<DataTableRef>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.dt()?.ajax.reload();
    }
  }, [searchParams]);

  return (
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

            const response = await fetch(`/api/dashboard/tires?${params.toString()}`);

            const result = await response.json();

            const order = d.order?.[0];

            if (order) {
              const columnIndex = order.column;
              const direction = order.dir;

              const columnName = d.columns[columnIndex].data;

              result.records.sort((a: any, b: any) => {
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
          { data: 'speedIndex' },
          { data: 'Patched' },
          { data: 'Tread' },
          { data: 'DOT' },
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
          <th data-order="1500">Speed</th>
          <th data-order="1500">Patched</th>
          <th data-order="1500">Tread</th>
          <th data-order="1500">DOT</th>
        </tr>
      </thead>
    </DataTable>
  );
};

export default DashboardTable;
