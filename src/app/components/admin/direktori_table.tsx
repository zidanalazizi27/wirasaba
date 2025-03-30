"use client";

import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Tooltip } from "primereact/tooltip";
import { FaDownload, FaUpload } from "react-icons/fa";
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

// Import PrimeReact styles
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";

const DirektoriTable = () => {
  // Dummy data
  const generateData = () => {
    const statuses = ["Active", "Inactive", "Pending"];
    const data = [];

    for (let i = 1; i <= 100; i++) {
      data.push({
        id: i,
        nama: `Perusahaan ${i}`,
        alamat: `Jl. Industri No. ${i}, Kecamatan ${i % 10}, Sidoarjo`,
        jarak: (Math.random() * 10).toFixed(2),
        pcl: `PCL-${i % 5 + 1}`,
        aktivitas: `Produksi ${i % 5 === 0 ? "Tekstil" : i % 4 === 0 ? "Makanan" : i % 3 === 0 ? "Elektronik" : i % 2 === 0 ? "Kimia" : "Logam"}`,
        status: statuses[i % 3],
      });
    }
    return data;
  };

  const [perusahaan, setPerusahaan] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nama: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    alamat: { value: null, matchMode: FilterMatchMode.CONTAINS },
    jarak: { value: null, matchMode: FilterMatchMode.EQUALS },
    pcl: { value: null, matchMode: FilterMatchMode.EQUALS },
    aktivitas: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  const [loading, setLoading] = useState(true);
  const [multiSortMeta, setMultiSortMeta] = useState([]);

  useEffect(() => {
    // Simulate API loading
    setLoading(true);
    setTimeout(() => {
      setPerusahaan(generateData());
      setLoading(false);
    }, 1000);
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex items-center">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Cari..."
              className="p-2"
            />
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<FaUpload />}
            label="Import"
            className="p-button-success mr-2"
            tooltip="Import data"
            tooltipOptions={{ position: "top" }}
          />
          <Button
            icon={<FaDownload />}
            label="Export"
            className="p-button-info"
            tooltip="Export data"
            tooltipOptions={{ position: "top" }}
          />
        </div>
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        severity={
          rowData.status === "Active"
            ? "success"
            : rowData.status === "Inactive"
            ? "danger"
            : "warning"
        }
        value={rowData.status}
      />
    );
  };

  const statusFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={["Active", "Inactive", "Pending"]}
        onChange={(e) => options.filterCallback(e.value)}
        placeholder="Pilih Status"
        className="p-column-filter"
        showClear
      />
    );
  };

  const pclFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={["PCL-1", "PCL-2", "PCL-3", "PCL-4", "PCL-5"]}
        onChange={(e) => options.filterCallback(e.value)}
        placeholder="Pilih PCL"
        className="p-column-filter"
        showClear
      />
    );
  };

  const actionBodyTemplate = () => {
    return (
      <div className="flex justify-center gap-2">
        <Button
          icon={
            <VisibilityRoundedIcon
              className="text-gray-500 hover:text-blue-500 transition-colors"
              style={{ fontSize: "1.2rem" }}
            />
          }
          className="p-button-text p-button-rounded"
          tooltip="Detail"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon={
            <EditRoundedIcon
              className="text-gray-500 hover:text-orange-500 transition-colors"
              style={{ fontSize: "1.2rem" }}
            />
          }
          className="p-button-text p-button-rounded"
          tooltip="Edit"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon={
            <DeleteRoundedIcon
              className="text-gray-500 hover:text-red-500 transition-colors"
              style={{ fontSize: "1.2rem" }}
            />
          }
          className="p-button-text p-button-rounded"
          tooltip="Hapus"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  const header = renderHeader();

  return (
    <div className="card">
      <Tooltip target=".export-buttons>button" position="bottom" />
      <DataTable
        value={perusahaan}
        paginator
        header={header}
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        filters={filters}
        filterDisplay="row"
        loading={loading}
        globalFilterFields={["nama", "alamat", "aktivitas", "pcl"]}
        emptyMessage="No data found"
        className="p-datatable-striped"
        removableSort
        multiSortMeta={multiSortMeta}
        onSort={(e) => setMultiSortMeta(e.multiSortMeta)}
        sortMode="multiple"
        responsiveLayout="stack"
        breakpoint="768px"
        scrollable
        scrollHeight="flex"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
      >
        <Column field="id" header="No" sortable style={{ width: "4rem" }} />
        <Column
          field="nama"
          header="Nama Usaha"
          filter
          filterPlaceholder="Cari nama..."
          sortable
          style={{ minWidth: "14rem" }}
        />
        <Column
          field="alamat"
          header="Alamat"
          filter
          filterPlaceholder="Cari alamat..."
          sortable
          style={{ minWidth: "18rem" }}
        />
        <Column
          field="jarak"
          header="Jarak"
          filter
          filterPlaceholder="Cari jarak..."
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="pcl"
          header="PCL"
          filter
          filterElement={pclFilterTemplate}
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="aktivitas"
          header="Aktivitas"
          filter
          filterPlaceholder="Cari aktivitas..."
          sortable
          style={{ minWidth: "14rem" }}
        />
        <Column
          field="status"
          header="Status"
          body={statusBodyTemplate}
          filter
          filterElement={statusFilterTemplate}
          style={{ minWidth: "10rem" }}
        />
        <Column
          body={actionBodyTemplate}
          exportable={false}
          header="Aksi"
          style={{ minWidth: "10rem", textAlign: "center" }}
        />
      </DataTable>
    </div>
  );
};

export default DirektoriTable;