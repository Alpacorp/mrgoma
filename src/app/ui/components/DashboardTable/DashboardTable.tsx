// 'use client';
// import { useEffect, useRef, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
// import DataTable from 'datatables.net-dt';
// import 'datatables.net-responsive-dt';

// // Importación de estilos
// import 'datatables.net-dt/css/dataTables.dataTables.css';
// import 'datatables.net-responsive-dt/css/responsive.dataTables.css';

// const DashboardTable = () => {
//   const searchParams = useSearchParams();

//   const tableRef = useRef(null);

//   const [showTable, setShowTable] = useState(false);

//   useEffect(() => {
//     //align all kind of data to left side
//     DataTable.type('num', 'className', '');
//     DataTable.type('date', 'className', '');

//     if (!tableRef.current) return;

//     const dt = new DataTable(tableRef.current, {
//       serverSide: true,
//       processing: true,
//       responsive: true,
//       searching: false,

//       ajax: async (data: any, callback) => {
//         try {
//           let params = new URLSearchParams();
//           const currentPage = Math.floor(data.start / data.length) + 1;

//           searchParams.forEach((value, key) => {
//             params.set(key, value);
//           });

//           params.set('page', currentPage.toString());
//           params.set('pageSize', data.length.toString()); // <- usa data.length

//           const response = await fetch(`/api/tires?${params.toString()}`);

//           const result = await response.json();

//           callback({
//             data: result.records,
//             recordsTotal: result.totalCount,
//             recordsFiltered: result.totalCount,
//           });
//         } catch (error) {
//           console.error(error);
//         }
//       },

//       columns: [
//         { data: 'TireId' },
//         { data: 'VaultName' },
//         { data: 'Brand' },
//         { data: 'Model2' },
//         { data: 'Size' },
//         { data: 'Height' },
//         { data: 'Width' },
//         { data: 'LoadIndexId' },
//         { data: 'speedIndex' },
//         { data: 'Patched' },
//         { data: 'Tread' },
//         { data: 'DOT' },
//       ],
//     });

//     dt.on('draw', () => {
//       setShowTable(true);
//     });

//     return () => {
//       dt.destroy();
//     };
//   }, [searchParams.toString()]);

//   return (
//     <>
//       {!showTable && <p className="text-center">Loading data...</p>}
//       <table ref={tableRef} className="display nowrap" style={{ width: '100%' }}>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Store</th>
//             <th>Brand</th>
//             <th>Model</th>
//             <th>Rin Diameter</th>
//             <th>Aspect Ratio</th>
//             <th>Width</th>
//             <th>Load Index</th>
//             <th>Speed</th>
//             <th>RFT</th>
//             <th>Tread</th>
//             <th>DOT</th>
//           </tr>
//         </thead>
//         <tbody></tbody>
//       </table>
//     </>
//   );
// };

// export default DashboardTable;

// 'use client';
// import { useEffect, useRef, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
// import DataTable from 'datatables.net-dt';
// import 'datatables.net-responsive-dt';

// // Importación de estilos
// import 'datatables.net-dt/css/dataTables.dataTables.css';
// import 'datatables.net-responsive-dt/css/responsive.dataTables.css';
// 'use client';
// import DataTable from 'datatables.net-react';
// import DT from 'datatables.net-dt';
// import Responsive from 'datatables.net-responsive-dt';

// DataTable.use(DT);
// DataTable.use(Responsive);

// const DashboardTable = () => {
//    const paramsKey =
//     typeof window !== 'undefined' ? window.location.search : '';

//   return (
//     <DataTable
//     key={paramsKey} 
//       ajax={async (data: any, callback) => {
//         try {
//           const params = new URLSearchParams(window.location.search);
      
//           const currentPage = Math.floor(data.start / data.length) + 1;
       
//           params.set('page', currentPage.toString());
//           params.set('pageSize', data.length.toString());
//           const response = await fetch(`/api/tires?${params.toString()}`);
//           const result = await response.json();
  
//           callback({
//             data: result.records,
//             recordsTotal: result.totalCount,
//             recordsFiltered: result.totalCount,
//           });
//         } catch (error) {
//           console.log("error", error)
//         }
//       }}
//       className="display nowrap"
//       options={{
//         responsive: true,
//         processing: true,
//         searching: false,
//         serverSide: true,
//         autoWidth: false,
//         columns: [
//           { data: 'TireId' },
//           { data: 'VaultName' },
//           { data: 'Brand' },
//           { data: 'Model2' },
//           { data: 'Size' },
//           { data: 'Height' },
//           { data: 'Width' },
//           { data: 'LoadIndexId' },
//           { data: 'speedIndex' },
//           { data: 'Patched' },
//           { data: 'Tread' },
//           { data: 'DOT' },
//         ],
//       }}
//     >
//      <thead>
//        <tr>
//          <th>ID</th>
//              <th>Store</th>
//              <th>Brand</th>
//              <th>Model</th>
//              <th>Rin Diameter</th>
//              <th>Aspect Ratio</th>
//              <th>Width</th>
//              <th>Load Index</th>
//              <th>Speed</th>
//              <th>RFT</th>
//              <th>Tread</th>
//              <th>DOT</th>
//            </tr>
//          </thead>
//        <tbody></tbody>
//     </DataTable>
//   );
// };

// export default DashboardTable;


'use client';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import Responsive from 'datatables.net-responsive-dt';
import { useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // <--- ESCUCHA LA URL

DataTable.use(DT);
DataTable.use(Responsive);

const DashboardTable = () => {
  const tableRef = useRef<any>(null);
  const searchParams = useSearchParams(); 

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.dt().ajax.reload();
    }
  }, [searchParams]);

  return (
    <DataTable
      ref={tableRef} 
      ajax={async (data: any, callback) => {
        try {
          const params = new URLSearchParams(window.location.search);
          const currentPage = Math.floor(data.start / data.length) + 1;
       
          params.set('page', currentPage.toString());
          params.set('pageSize', data.length.toString());
          
          const response = await fetch(`/api/tires?${params.toString()}`);
          const result = await response.json();
  
          callback({
            draw: data.draw,
            data: result.records || [],
            recordsTotal: result.totalCount || 0,
            recordsFiltered: result.totalCount || 0,
          });
        } catch (error) {
          console.error("Error en fetch:", error);
        }
      }}
      className="display nowrap"
      options={{
        responsive: true,
        processing: true,
        searching: false,
        serverSide: true,
        autoWidth: false,
                columns: [
          { data: 'TireId' },
          { data: 'VaultName' },
          { data: 'Brand' },
          { data: 'Model2' },
          { data: 'Size' },
          { data: 'Height' },
          { data: 'Width' },
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
          <th>ID</th><th>Store</th><th>Brand</th><th>Model</th>
          <th>Rin</th><th>Aspect</th><th>Width</th><th>Load</th>
          <th>Speed</th><th>RFT</th><th>Tread</th><th>DOT</th>
        </tr>
      </thead>
    </DataTable>
  );
};

export default DashboardTable;

