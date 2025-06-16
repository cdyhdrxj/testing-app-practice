"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

export default function ResultsPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<TestResult[]>([])
  
  const fetchData = async () => {
    try {
      const response = await resultsAPI.getResults()
      setResults(response)
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [enqueueSnackbar])

  const handleBack = () => {
    router.push("/")
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
        <PageHeader title="Результаты" />
      </Box>
      <ResultsTable loading={loading} show_test={true} show_user={false} results={results}/>
    </>
  )
}
