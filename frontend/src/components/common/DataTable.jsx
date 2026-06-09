import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  globalFilterPlaceholder = 'Cari...',
  extraFilters = null,
  onRowClick = null,
  emptyText = 'Tidak ada data.',
  showGlobalFilter = true,
}) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  })

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  })

  const pageCount = table.getPageCount()
  const rowCount = table.getFilteredRowModel().rows.length
  const pageIndex = pagination.pageIndex
  const pageSize = pagination.pageSize

  const start = pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, rowCount)

  const pageNumbers = useMemo(() => {
    const cur = pageIndex + 1
    const delta = 2
    const res = []
    for (let i = Math.max(1, cur - delta); i <= Math.min(pageCount, cur + delta); i++) {
      res.push(i)
    }
    return res
  }, [pageIndex, pageCount])

  return (
    <div className="card overflow-hidden border border-yellow-100">

      {/* ===== TOOLBAR ===== */}
      <div className="p-4 space-y-4 border-b border-yellow-100 bg-white">

        {/* SEARCH */}
        {showGlobalFilter && (
          <div className="relative w-full">
            <input
              value={globalFilter}
              onChange={e => {
                setGlobalFilter(e.target.value)
                table.setPageIndex(0)
              }}
              placeholder={globalFilterPlaceholder}
              className="input w-full pl-9 py-2 text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}

        {/* FILTERS + PAGE SIZE */}
        <div className="flex items-end gap-2 flex-wrap justify-between">

          {/* LEFT FILTERS */}
          <div className="flex-1">
            {extraFilters}
          </div>

          {/* PAGE SIZE */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <span className="text-[11px] text-stone-500">Tampilkan</span>
            <select
              className="select py-2 text-sm"
              value={pageSize === 99999 ? 99999 : pageSize}
              onChange={e => {
                const val = Number(e.target.value)
                table.setPageSize(val === 99999 ? 99999 : val)
                table.setPageIndex(0)
              }}
            >
              {PAGE_SIZE_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value={99999}>Semua</option>
            </select>
          </div>

        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">

          <thead className="bg-yellow-50 text-stone-700">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide border-b border-yellow-100"
                    onClick={header.column.getCanSort()
                      ? header.column.getToggleSortingHandler()
                      : undefined}
                  >
                    <div className="flex items-center gap-1 cursor-pointer">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && '↑'}
                      {header.column.getIsSorted() === 'desc' && '↓'}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-yellow-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-yellow-100 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-stone-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={`hover:bg-yellow-50 transition ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="px-4 py-3 border-t border-yellow-100 flex justify-between text-xs text-stone-500">
        <div>
          {rowCount > 0 ? `${start}–${end} dari ${rowCount}` : 'Tidak ada data'}
        </div>
        <div className="flex gap-2">
          <button onClick={() => table.setPageIndex(0)}>«</button>
          <button onClick={() => table.previousPage()}>‹</button>
          {pageNumbers.map(p => (
            <button
              key={p}
              onClick={() => table.setPageIndex(p - 1)}
              className={pageIndex + 1 === p ? 'font-bold text-yellow-700' : ''}
            >
              {p}
            </button>
          ))}
          <button onClick={() => table.nextPage()}>›</button>
          <button onClick={() => table.setPageIndex(pageCount - 1)}>»</button>
        </div>
      </div>

    </div>
  )
}