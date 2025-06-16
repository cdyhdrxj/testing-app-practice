"use client"

import type React from "react"
import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import IconButton from "@mui/material/IconButton"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import CardContent from "@mui/material/CardContent"
import FormControlLabel from "@mui/material/FormControlLabel"
import Checkbox from "@mui/material/Checkbox"
import RadioGroup from "@mui/material/RadioGroup"
import Radio from "@mui/material/Radio"
import FormControl from "@mui/material/FormControl"
import FormGroup from "@mui/material/FormGroup"
import PageHeader from "@/components/common/PageHeader"
import ConfirmDialog from "@/components/common/ConfirmDialog"
import { resultsAPI, testsAPI } from "@/lib/api"
import type { Answer, Question, Test, TestResult } from "@/lib/types"
import { QuestionType } from "@/lib/types"

interface TestPageProps {
  params: Promise<{
    id: number
  }>
}

// Ответы пользователя
interface UserAnswers {
  [questionId: number]: {
    type: QuestionType
    singleAnswer?: number // id выбранного ответа
    multipleAnswers?: number[] // список id выбранных ответов
    textAnswer?: string // текстовый ответ
  }
}

export default function TestPage({ params }: TestPageProps) {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [isStart, setIsStart] = useState(false)
  const [isEnd, setIsEnd] = useState(false)
  const [timeStart, setTimeStart] = useState<string>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [test, setTest] = useState<Test>()
  const [result, setResult] = useState<TestResult>()
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await testsAPI.getTest(id)
        setTest(response)

        const initialAnswers: UserAnswers = {}
        response.questions.forEach((question: Question) => {
          initialAnswers[question.id] = {
            type: question.type,
            multipleAnswers: question.type === QuestionType.MULTIPLE ? [] : undefined,
            textAnswer: question.type === QuestionType.TEXT ? "" : undefined,
          }
        })
        setUserAnswers(initialAnswers)
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" })
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, enqueueSnackbar])

  // Обработчик для одиночного выбора
  const handleSingleAnswerChange = (questionId: number, answerId: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        singleAnswer: answerId,
      },
    }))
  }

  // Обработчик для множественного выбора
  const handleMultipleAnswerChange = (questionId: number, answerId: number, checked: boolean) => {
    setUserAnswers((prev) => {
      const currentAnswers = prev[questionId]?.multipleAnswers || []
      const newAnswers = checked ? [...currentAnswers, answerId] : currentAnswers.filter((id) => id !== answerId)

      return {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          multipleAnswers: newAnswers,
        },
      }
    })
  }

  // Обработчик для текстового ответа
  const handleTextAnswerChange = (questionId: number, text: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        textAnswer: text,
      },
    }))
  }

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()

    // Формируем структуру ответов в нужном формате
    const formattedAnswers = {
      time_start: timeStart,
      time_end: new Date().toISOString(),
      questions: test?.questions.map((question) => {
        const userAnswer = userAnswers[question.id]
        const questionResult: any = {
          id: question.id,
          answers: [],
        }

        switch (question.type) {
          case QuestionType.SINGLE:
            if (userAnswer?.singleAnswer !== undefined) {
              questionResult.answers.push({
                id: userAnswer.singleAnswer,
              })
            }
            break

          case QuestionType.MULTIPLE:
            if (userAnswer?.multipleAnswers && userAnswer.multipleAnswers.length > 0) {
              questionResult.answers = userAnswer.multipleAnswers.map((answerId) => ({
                id: answerId,
              }))
            }
            break

          case QuestionType.TEXT:
            if (userAnswer?.textAnswer && userAnswer.textAnswer.trim()) {
              questionResult.answers.push({
                id: 0,
                text: userAnswer.textAnswer.trim(),
              })
            }
            break
        }

        return questionResult
      }),
    }

    setLoading(true)
    try {
      const response = await resultsAPI.createResults(id, formattedAnswers)
      setResult(response)
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleStart = () => {
    setTimeStart(new Date().toISOString())
    setIsStart(true)
  }

  const handleBack = () => {
    router.push("/")
  }

  const handleEnd = () => {
    setIsDialogOpen(false)
    handleCheck(new Event("submit") as any)
    setIsEnd(true)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderAnswers = (question: Question) => {
    const questionAnswers = userAnswers[question.id]

    switch (question.type) {
      case QuestionType.SINGLE:
        return (
          <FormControl component="fieldset" sx={{ width: "100%" }}>
            <RadioGroup
              value={questionAnswers?.singleAnswer || ""}
              onChange={(e) => handleSingleAnswerChange(question.id, Number.parseInt(e.target.value))}
            >
              {question.answers.map((answer: Answer) => (
                <FormControlLabel key={answer.id} value={answer.id} control={<Radio />} label={answer.text} />
              ))}
            </RadioGroup>
          </FormControl>
        )

      case QuestionType.MULTIPLE:
        return (
          <FormControl component="fieldset" sx={{ width: "100%" }}>
            <FormGroup>
              {question.answers.map((answer: any) => (
                <FormControlLabel
                  key={answer.id}
                  control={
                    <Checkbox
                      checked={questionAnswers?.multipleAnswers?.includes(answer.id) || false}
                      onChange={(e) => handleMultipleAnswerChange(question.id, answer.id, e.target.checked)}
                    />
                  }
                  label={answer.text}
                />
              ))}
            </FormGroup>
          </FormControl>
        )

      case QuestionType.TEXT:
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={questionAnswers?.textAnswer || ""}
            onChange={(e) => handleTextAnswerChange(question.id, e.target.value)}
            sx={{ mt: 1 }}
          />
        )
    }
  }

  if (loading || !test) {
    return <Typography>Загрузка...</Typography>
  }

  return (
    <>
      <ConfirmDialog
        open={!isStart}
        title={"Подтверждение"}
        message={`Вы уверены, что хотите начать тест "${test.name}"?`}
        onConfirm={handleStart}
        onCancel={handleBack}
      />
      <ConfirmDialog
        open={isDialogOpen}
        title={"Подтверждение"}
        message="Вы уверены, что хотите завершить тест?"
        onConfirm={handleEnd}
        onCancel={() => setIsDialogOpen(false)}
      />
      {isStart && !isEnd && (
        <>
          <Box sx={{ mb: 1, display: "flex", alignItems: "flex-start" }}>
            <IconButton onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
            <PageHeader title={test.name} />
          </Box>
          <form
            action="submit"
            onSubmit={(e) => {
              e.preventDefault()
              setIsDialogOpen(true)
            }}
          >
            {test.questions.map((question, questionIndex) => (
              <Card key={questionIndex} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Typography variant="body1">Вопрос {questionIndex + 1}</Typography>
                    </Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {question.text}
                    </Typography>
                  </Box>
                  {renderAnswers(question)}
                </CardContent>
              </Card>
            ))}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button type="submit" variant="contained">
                Проверить
              </Button>
            </Box>
          </form>
        </>
      )}
      {isEnd && (
        <>
          <Box sx={{ mb: 1, display: "flex", alignItems: "flex-start" }}>
            <IconButton onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
            <PageHeader title="Результаты теста" />
          </Box>
          {result && (
            <Card sx={{ p: 3, mb: 3, boxShadow: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {result.test.name}
                </Typography>
                <Box display={"flex"}>
                  <Box sx={{ textAlign: 'center', mr: 10 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Результат
                    </Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'baseline' }}>
                      <Typography
                        variant="h3"
                        color="primary"
                        sx={{ fontWeight: 'bold', mr: 1 }}
                      >
                        {result.score}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        / {result.full_score}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Начало
                      </Typography>
                      <Typography variant="body1">
                        {formatDateTime(result.time_start)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Завершение
                      </Typography>
                      <Typography variant="body1">
                        {formatDateTime(result.time_end)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>
          )}
        </>
      )}
    </>
  )
}
