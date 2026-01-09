"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, ChevronRight, Upload } from "lucide-react"
import QRCodeDisplay from "./qr-code-display"

type WorkflowStep = "initial" | "review" | "payment" | "confirmation"

// Course data with fees
const COURSES = [
  { id: "foundation", name: "Foundation Course (Class 9-10)", fee: 5000 },
  { id: "intermediate", name: "Intermediate Course (Class 11-12)", fee: 7000 },
  { id: "advanced", name: "Advanced Course (Class 12+)", fee: 10000 },
  { id: "jee", name: "JEE Preparation", fee: 12000 },
  { id: "neet", name: "NEET Preparation", fee: 12000 },
]

interface WorkflowState {
  studentId: string
  selectedCourses: string[]
  upiId: string
  transactionId: string
  paymentFile: File | null
  adminUIId: string
}

export default function PaymentWorkflow() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("initial")
  const [formData, setFormData] = useState<WorkflowState>({
    studentId: "",
    selectedCourses: [],
    upiId: "",
    transactionId: "",
    paymentFile: null,
    adminUIId: "333333@oniksai",
  })

  const handleInputChange = (field: keyof WorkflowState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCourseToggle = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter((id) => id !== courseId)
        : [...prev.selectedCourses, courseId],
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, paymentFile: e.target.files![0] }))
    }
  }

  const calculateTotalFee = () => {
    return formData.selectedCourses.reduce((total, courseId) => {
      const course = COURSES.find((c) => c.id === courseId)
      return total + (course?.fee || 0)
    }, 0)
  }

  const getSelectedCourseNames = () => {
    return formData.selectedCourses.map((id) => COURSES.find((c) => c.id === id)?.name || "").filter(Boolean)
  }

  const proceedToReview = () => {
    if (formData.studentId && formData.selectedCourses.length > 0) {
      setCurrentStep("review")
    }
  }

  const proceedToPayment = () => {
    setCurrentStep("payment")
  }

  const submitPayment = () => {
    if (formData.upiId && formData.transactionId && formData.paymentFile) {
      setCurrentStep("confirmation")
    }
  }

  const resetWorkflow = () => {
    setCurrentStep("initial")
    setFormData({
      studentId: "",
      selectedCourses: [],
      upiId: "",
      transactionId: "",
      paymentFile: null,
      adminUIId: "333333@oniksai",
    })
  }

  const totalFee = calculateTotalFee()
  const selectedCourseNames = getSelectedCourseNames()

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Payment Portal</h1>
          <p className="text-gray-600">Complete your payment workflow in simple steps</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep === "initial"
                  ? "bg-blue-600 text-white"
                  : ["review", "payment", "confirmation"].includes(currentStep)
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <span
              className={`text-sm hidden sm:inline ${currentStep === "initial" ? "text-blue-600" : "text-gray-600"}`}
            >
              Details
            </span>
          </div>
          <div
            className={`flex-1 h-1 mx-3 rounded ${
              ["review", "payment", "confirmation"].includes(currentStep) ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep === "review"
                  ? "bg-blue-600 text-white"
                  : ["payment", "confirmation"].includes(currentStep)
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <span
              className={`text-sm hidden sm:inline ${
                ["review", "payment", "confirmation"].includes(currentStep) ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Review
            </span>
          </div>
          <div
            className={`flex-1 h-1 mx-3 rounded ${
              ["payment", "confirmation"].includes(currentStep) ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep === "payment"
                  ? "bg-blue-600 text-white"
                  : currentStep === "confirmation"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
            <span
              className={`text-sm hidden sm:inline ${
                ["payment", "confirmation"].includes(currentStep) ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Payment
            </span>
          </div>
          <div
            className={`flex-1 h-1 mx-3 rounded ${currentStep === "confirmation" ? "bg-blue-600" : "bg-gray-200"}`}
          />
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep === "confirmation" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              4
            </div>
            <span
              className={`text-sm hidden sm:inline ${currentStep === "confirmation" ? "text-blue-600" : "text-gray-600"}`}
            >
              Confirm
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Initial Form - Course and Student ID Selection */}
          {currentStep === "initial" && (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Your Courses</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Student ID</label>
                    <Input
                      type="text"
                      placeholder="Enter your student ID"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange("studentId", e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Available Courses</label>
                    <div className="space-y-3">
                      {COURSES.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                          onClick={() => handleCourseToggle(course.id)}
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedCourses.includes(course.id)}
                            onChange={() => {}}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{course.name}</p>
                            <p className="text-sm text-blue-600 font-semibold">₹{course.fee.toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={proceedToReview}
                    disabled={!formData.studentId || formData.selectedCourses.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
                  >
                    Review Details <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Review Details */}
          {currentStep === "review" && (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>

                <div className="space-y-6">
                  <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Student ID</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{formData.studentId}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Selected Courses</p>
                        <div className="mt-2 space-y-1">
                          {selectedCourseNames.map((courseName, idx) => (
                            <p key={idx} className="text-sm text-gray-900">
                              • {courseName}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t-2 border-blue-200">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Monthly Amount</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">₹{totalFee.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setCurrentStep("initial")}
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Back
                    </Button>
                    <Button onClick={proceedToPayment} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      Proceed to Payment <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Payment Form */}
          {currentStep === "payment" && (
            <div className="space-y-6">
              <Card className="border border-gray-200 bg-white shadow-sm">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Scan QR Code</h2>
                  <QRCodeDisplay adminUIId={formData.adminUIId} />
                  <p className="text-sm text-gray-600 mt-4">Admin UI ID: {formData.adminUIId}</p>
                </div>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your UPI ID</label>
                      <Input
                        type="text"
                        placeholder="yourname@upi"
                        value={formData.upiId}
                        onChange={(e) => handleInputChange("upiId", e.target.value)}
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction / URN Number</label>
                      <Input
                        type="text"
                        placeholder="Enter your transaction or URN number"
                        value={formData.transactionId}
                        onChange={(e) => handleInputChange("transactionId", e.target.value)}
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Screenshot</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Upload className="w-5 h-5 text-gray-600 mr-2" />
                          <span className="text-gray-600">
                            {formData.paymentFile ? formData.paymentFile.name : "Click to upload or drag and drop"}
                          </span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">JPG/JPEG only, 30-49 KB, min 140x60 px</p>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={() => setCurrentStep("review")}
                        variant="outline"
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={submitPayment}
                        disabled={!formData.upiId || !formData.transactionId || !formData.paymentFile}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Confirm Payment
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === "confirmation" && (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h2>
                <p className="text-gray-600 mb-6">Your payment has been processed successfully</p>

                <div className="space-y-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Application Number</p>
                    <p className="text-lg font-mono text-blue-600">37459348558890</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Payment Reference Number</p>
                    <p className="text-lg font-mono text-blue-600">45w349f845</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    Download Application Form
                  </Button>
                  <Button
                    onClick={resetWorkflow}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                  >
                    New Payment
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
