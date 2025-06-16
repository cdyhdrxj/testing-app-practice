"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import IconButton from "@mui/material/IconButton"
import FormControlLabel from "@mui/material/FormControlLabel"
import Checkbox from "@mui/material/Checkbox"
import RadioGroup from "@mui/material/RadioGroup"
import Radio from "@mui/material/Radio"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import Tooltip from "@mui/material/Tooltip"
import PageHeader from "@/components/common/PageHeader"
import type { Category, TestCreate, QuestionCreate as Question, AnswerCreate as Answer } from "@/lib/types"
import { QuestionType } from "@/lib/types"
import { categoriesAPI, testsAPI } from "@/lib/api"

const questionTypeLabels = {
  [QuestionType.SINGLE]: "Один вариант ответа",
  [QuestionType.MULTIPLE]: "Несколько вариантов ответа",
  [QuestionType.TEXT]: "Текстовый ответ",
}

interface TestAdminPageProps {
  params: Promise<{
    id: string
  }>
}

export default function TestAdminPage({ params } : TestAdminPageProps) {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const { id } = use(params)
  const isNew = id === "new"
  const [loading, setLoading] = useState(!isNew)
  const [categories, setCategories] = useState<Category[]>([])
  const [test, setTest] = useState<TestCreate>({
    id: undefined,
    category_id: undefined,
    name: "",
    questions: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await categoriesAPI.getCategories()
        setCategories(response)

        if (!isNew) {
          const response = await testsAPI.getTestAdmin(parseInt(id))
          setTest({
            id: response.id,
            category_id: response.category.id,
            name: response.name,
            questions: response.questions,
          })
        }
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" })
        router.push("/admin/tests")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, isNew, enqueueSnackbar])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (test.questions.length === 0) {
      enqueueSnackbar("Добавьте хотя бы один вопрос", { variant: "error" })
      return
    }

    const invalidQuestionIndex = test.questions.findIndex(
      (q) => !q.answers.some((a) => a.is_correct)
    )

    if (invalidQuestionIndex !== -1) {
      enqueueSnackbar(`Вопрос ${invalidQuestionIndex + 1} не имеет правильного ответа`, { variant: "error" })
      return
    }

    setLoading(true)
    try {
      if (isNew) {
        testsAPI.createTest(test)
      }
      else if (id) {
        testsAPI.updateTest(parseInt(id), test)
      }
      router.push("/admin/tests")
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    setTest((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: undefined,
          text: "",
          type: QuestionType.SINGLE,
          answers: [
            { id: undefined, text: "", is_correct: false },
            { id: undefined, text: "", is_correct: false },
          ],
        },
      ],
    }))
  }

  const removeQuestion = (index: number) => {
    setTest((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setTest((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    }))
  }

  const addAnswer = (questionIndex: number) => {
    setTest((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex ? { ...q, answers: [...q.answers, { id: undefined, text: "", is_correct: false }] } : q,
      ),
    }))
  }

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    setTest((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex ? { ...q, answers: q.answers.filter((_, ai) => ai !== answerIndex) } : q,
      ),
    }))
  }

  const updateAnswer = (questionIndex: number, answerIndex: number, field: keyof Answer, value: any) => {
    setTest((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              answers: q.answers.map((a, ai) => (ai === answerIndex ? { ...a, [field]: value } : a)),
            }
          : q,
      ),
    }))
  }

  const handleQuestionTypeChange = (questionIndex: number, newType: QuestionType) => {
    setTest((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== questionIndex) return q

        let answers = q.answers
        if (newType === QuestionType.TEXT) {
          answers = [{ id: undefined, text: "", is_correct: true }]
        } else {
          answers = [
            { id: undefined, text: "", is_correct: false },
            { id: undefined, text: "", is_correct: false },
          ]
        }

        return { ...q, type: newType, answers }
      }),
    }))
  }

  if (loading) {
    return <Typography>Загрузка...</Typography>
  }

  return (
    <>
      <Box sx={{ mb: 1, display: "flex", alignItems: "flex-start" }}>
        <IconButton onClick={() => router.push("/admin/tests")}>
          <ArrowBackIcon />
        </IconButton>
        <PageHeader title={isNew ? "Создание теста" : "Редактирование теста"}/>
      </Box>
      <form action="submit" onSubmit={handleSave}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              required
              fullWidth
              multiline
              rows={2}
              label="Название теста"
              value={test.name}
              onChange={(e) => setTest((prev) => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
              slotProps={{
                htmlInput: {
                  minLength: 1,
                  maxLength: 1000,
                }
              }}
            />
            <FormControl fullWidth required>
              <InputLabel>Категория</InputLabel>
              <Select
                value={test.category_id ?? ""}
                label="Категория"
                onChange={(e) => setTest((prev) => ({ ...prev, category_id: Number(e.target.value) }))}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5">Вопросы</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={addQuestion}>
            Добавить вопрос
          </Button>
        </Box>

        {test.questions.map((question, questionIndex) => (
          <Card key={questionIndex} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Typography variant="h6">Вопрос {questionIndex + 1}</Typography>
                <Tooltip title="Удалить">
                  <IconButton color="error" onClick={() => removeQuestion(questionIndex)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <TextField
                fullWidth
                label="Текст вопроса"
                multiline
                rows={3}
                value={question.text}
                onChange={(e) => updateQuestion(questionIndex, "text", e.target.value)}
                sx={{ mb: 2 }}
                required
                slotProps={{
                  htmlInput: {
                    minLength: 1,
                    maxLength: 1000,
                  }
                }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Тип вопроса</InputLabel>
                <Select
                  value={question.type}
                  label="Тип вопроса"
                  onChange={(e) => handleQuestionTypeChange(questionIndex, Number(e.target.value) as QuestionType)}
                >
                  {Object.entries(questionTypeLabels).map(([value, label]) => (
                    <MenuItem key={value} value={Number(value)}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {question.type !== QuestionType.TEXT && (
                <>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle1">Варианты ответов</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={() => addAnswer(questionIndex)}>
                      Добавить ответ
                    </Button>
                  </Box>

                  {question.answers.map((answer, answerIndex) => (
                    <Box key={answerIndex} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <TextField
                        required
                        fullWidth
                        size="small"
                        label={`Ответ ${answerIndex + 1}`}
                        value={answer.text}
                        onChange={(e) => updateAnswer(questionIndex, answerIndex, "text", e.target.value)}
                        slotProps={{
                          htmlInput: {
                            minLength: 1,
                            maxLength: 1000,
                          }
                        }}
                      />

                      {question.type === QuestionType.SINGLE ? (
                        <RadioGroup
                          value={question.answers.findIndex((a) => a.is_correct)}
                          onChange={(e) => {
                            const correctIndex = Number(e.target.value)
                            question.answers.forEach((_, i) => {
                              updateAnswer(questionIndex, i, "is_correct", i === correctIndex)
                            })
                          }}
                          row
                        >
                          <FormControlLabel value={answerIndex} control={<Radio size="small" />} label="" />
                        </RadioGroup>
                      ) : (
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={answer.is_correct}
                              onChange={(e) => updateAnswer(questionIndex, answerIndex, "is_correct", e.target.checked)}
                            />
                          }
                          label=""
                        />
                      )}

                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeAnswer(questionIndex, answerIndex)}
                          disabled={question.answers.length <= 2}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </>
              )}

              {question.type === QuestionType.TEXT && (
                <>
                  {question.answers.map((answer, answerIndex) => (
                    <Box key={answerIndex} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        required
                        size="small"
                        label="Ответ"
                        value={answer.text}
                        onChange={(e) => updateAnswer(questionIndex, answerIndex, "text", e.target.value)}
                        slotProps={{
                          htmlInput: {
                            minLength: 1,
                            maxLength: 1000,
                          }
                        }}
                      />
                    </Box>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        ))}

        {test.questions.length === 0 && (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Нет вопросов
              </Typography>
            </CardContent>
          </Card>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button type="submit" variant="contained">
            Сохранить
          </Button>
        </Box>
      </form>
    </>
  )
}
