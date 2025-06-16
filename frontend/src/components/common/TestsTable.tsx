"use client"

import Box from "@mui/material/Box"
import Link from "next/link"
import { Link as MuiLink } from '@mui/material'
import Paper from "@mui/material/Paper"
import { DataGrid } from "@mui/x-data-grid"
import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"
import VisibilityIcon from "@mui/icons-material/Visibility"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import { TestReadPreview } from "@/lib/types"

const paginationModel = { page: 0, pageSize: 5 }

const localizedTextsMap = {
  noRowsLabel: "Тесты не найдены",

  columnMenuLabel: "Меню",
  columnMenuFilter: "Фильтр",
  columnMenuUnsort: "Отмена",
  columnMenuSortAsc: "По возрастанию",
  columnMenuSortDesc: "По убыванию",

  filterOperatorContains: "содержит",
  filterOperatorDoesNotContain: "не содержит",
  filterOperatorEquals: "равно",
  filterOperatorDoesNotEqual: "не равно",
  filterOperatorStartsWith: "начинается с",
  filterOperatorEndsWith: "заканчивается на",
  filterOperatorIsEmpty: "пусто",
  filterOperatorIsNotEmpty: "не пусто",
  filterOperatorIsAnyOf: "любое из",

  filterPanelDeleteIconLabel: "Удалить",
  columnHeaderSortIconLabel: "Сортировать",

  filterPanelOperator: "Оператор",
  filterPanelColumns: "Столбец",
  filterPanelInputLabel: "Значение",
  filterPanelInputPlaceholder: "Значение фильтра",

  paginationRowsPerPage: "Строк на странице:",
  paginationDisplayedRows: ({ from, to, count, estimated }: any) => {
    if (!estimated) {
      return `${from}–${to} из ${count !== -1 ? count : `больше ${to}`}`
    }
    const estimatedLabel = estimated && estimated > to ? `около ${estimated}` : `больше ${to}`
    return `${from}–${to} из ${count !== -1 ? count : estimatedLabel}`
  },
}

interface TestTableProps {
  links?: boolean,
  tests: TestReadPreview[],
  handleView?: (id: number) => void,
  handleEdit?: (id: number) => void,
  handleDelete?: (id: number) => void,
}

export default function TestTable({
  links = false,
  tests,
  handleView,
  handleEdit,
  handleDelete,
}: TestTableProps) {
  const columns = [
    {
      field: "name",
      headerName: "Название",
      flex: 3,
      renderCell: (params: any) => {
        if (links) {
          return (
            <MuiLink
              component={Link}
              href={`/tests/${params.row.id}`}
              color="inherit"
              underline="hover"
              sx={{
                width: '100%',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {params.row.name}
            </MuiLink>
          )
        }
        return params.row.name
      }
    },
    { 
      field: "category", 
      headerName: "Категория", 
      flex: 2,
      valueGetter: (params: any) => params.name
    },
    {
      field: "actions",
      headerName: "Действия",
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      renderCell: (params: any) => {
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            {handleView &&
              <Tooltip title="Просмотр">
                <IconButton 
                  color="primary" 
                  size="small"
                  onClick={() => handleView(params.row.id)}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            }
            
            {handleEdit &&
              <Tooltip title="Редактировать">
                <IconButton 
                  color="primary" 
                  size="small"
                  onClick={() => handleEdit(params.row.id)}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            }
            
            {handleDelete &&
              <Tooltip title="Удалить">
                <IconButton 
                  color="error" 
                  size="small"
                  onClick={() => handleDelete(params.row.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            }
          </Box>
        )
      },
    },
  ]

  return (
    <Paper sx={{ width: "100%" }}>
      <DataGrid
        rowSelection={false}
        disableColumnSelector={true}
        rows={tests}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10, 25]}
        sx={{ border: 0 }}
        localeText={localizedTextsMap}
      />
    </Paper>
  )
}
