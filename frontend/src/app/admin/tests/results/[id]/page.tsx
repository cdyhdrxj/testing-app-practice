"use client"

import type React from "react"
import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import PageHeader from "@/components/common/PageHeader"
import Box from "@mui/material/Box"
import { resultsAPI } from "@/lib/api"
import { TestResult } from "@/lib/types"
import ResultsTable from "@/components/common/ResultsTable"

interface ResultsAdminPageProps {
  params: Promise<{
    id: number
  }>
}

export default function ResultsAdminPage({ params }: ResultsAdminPageProps) {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<TestResult[]>([])
  
  const fetchData = async () => {
    try {
      const response = await resultsAPI.getResultsAdmin(id)
      setResults(response)
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" })
      router.push("/admin/tests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id, enqueueSnackbar])

  const handleBack = () => {
    router.push("/admin/tests")
  }

  if (loading) {
    return <Typography>Загрузка...</Typography>
  }

  return (
    <>
      <Box sx={{ mb: 1, display: "flex", alignItems: "flex-start" }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <PageHeader title="Результаты теста" />
      </Box>
      <ResultsTable loading={loading} show_test={false} show_user={true} results={results}/>
    </>
  )
}
