"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSnackbar } from "notistack"
import { useRouter } from "next/navigation"
import { testsAPI } from "@/lib/api"
import { TestReadPreview } from "@/lib/types"
import PageHeader from "@/components/common/PageHeader"
import ConfirmDialog from "@/components/common/ConfirmDialog"
import TestsTable from "@/components/common/TestsTable"

export default function TestAdminPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [tests, setTests] = useState<TestReadPreview[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testToDelete, setTestToDelete] = useState<number | null>(null)

  const fetchTests = async () => {
    try {
      const response = await testsAPI.getTests()
      setTests(response)
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" })
    }
  }

  useEffect(() => {
    fetchTests()
  }, [])

  const handleAddTest = () => {
    router.push("/admin/tests/new")
  }

  const handleEditTest = (id: number) => {
    router.push(`/admin/tests/${id}`)
  }

  const handleViewResults = (id: number) => {
    router.push(`/admin/tests/results/${id}`)
  }

  const handleDeleteClick = (id: number) => {
    setTestToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!testToDelete) return

    try {
      await testsAPI.deleteTest(testToDelete)
      enqueueSnackbar("Тест успешно удален", { variant: "success" })
      fetchTests()
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" })
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <PageHeader title="Тесты" buttonText="Добавить тест" onButtonClick={handleAddTest} />
      <TestsTable
        tests={tests}
        handleView={handleViewResults}
        handleEdit={handleEditTest}
        handleDelete={handleDeleteClick}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Удаление теста"
        message={"Вы уверены, что хотите удалить этот тест?"}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  )
}
