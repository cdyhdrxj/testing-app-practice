"use client"

import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import { TestResult } from "@/lib/types"

interface ResultsTableProps {
  loading: boolean,
  show_user: boolean,
  show_test: boolean,
  results: TestResult[],
}

export default function ResultsTable({ loading, show_user = false, show_test = false, results} : ResultsTableProps) {
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Paper sx={{ width: "100%", mb: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {show_test && <TableCell>Тест</TableCell>}
              {show_user && <TableCell>Пользователь</TableCell>}
              <TableCell>Время начала</TableCell>
              <TableCell>Время завершения</TableCell>
              <TableCell align="center">Результат</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!results || results.length === 0) && !loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Результаты не найдены
                </TableCell>
              </TableRow>
            )}
            {results && results.length !== 0 && results.map((result) => (
              <TableRow key={result.id}>
                {show_test && <TableCell>{result.test.name}</TableCell>}
                {show_user && <TableCell>{result.user.name}</TableCell>}
                <TableCell>{formatDateTime(result.time_start)}</TableCell>
                <TableCell>{formatDateTime(result.time_end)}</TableCell>
                <TableCell align="center">{`${result.score}/${result.full_score}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
