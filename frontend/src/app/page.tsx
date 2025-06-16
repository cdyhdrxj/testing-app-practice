"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSnackbar } from "notistack"
import { useRouter } from "next/navigation"
import Divider from "@mui/material/Divider"
import Link from "next/link"
import { Link as MuiLink } from "@mui/material"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import { recommendAPI, testsAPI } from "@/lib/api"
import { TestReadPreview } from "@/lib/types"
import PageHeader from "@/components/common/PageHeader"
import TestsTable from "@/components/common/TestsTable"
import { Paper } from "@mui/material"

export default function MainPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [tests, setTests] = useState<TestReadPreview[]>([])
  const [recommendedTests, setRecommendedTests] = useState<TestReadPreview[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTests = async () => {
    setLoading(true)
    try {
      const response = await testsAPI.getTests()
      const responseRecommend = await recommendAPI.getTests()
      setTests(response)
      setRecommendedTests(responseRecommend)
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTests()
  }, [])

  const handleViewResults = () => {
    router.push("/results")
  }

  const handleViewResultsId = (id: number) => {
    router.push(`/results/${id}`)
  }

  return (
    <>
      <PageHeader title="Рекомендованные тесты"/>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Категория</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!recommendedTests || recommendedTests.length === 0) && !loading && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    Тесты не найдены
                  </TableCell>
                </TableRow>
              )}
              {recommendedTests && recommendedTests.length !== 0 && recommendedTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <MuiLink
                      component={Link}
                      href={`/tests/${test.id}`}
                      color="inherit"
                      underline="none"
                      sx={{
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {test.name}
                    </MuiLink>
                  </TableCell>
                  <TableCell>{test.category.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Divider sx={{ my: 3 }}/>
      <PageHeader
        title="Все тесты"
        buttonText="Результаты тестов"
        onButtonClick={handleViewResults}
      />
      <TestsTable
        links={true}
        tests={tests}
        handleView={handleViewResultsId}
      />
    </>
  )
}
