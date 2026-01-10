"use client"

import { useEffect, useRef } from "react"
import {QRCode} from "qrcode"

    interface QRCodeDisplayProps {
    adminUIId: string
    }

    export default function QRCodeDisplay({ adminUIId }: QRCodeDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const generateQRCode = async () => {
        if (!canvasRef.current) return

        try {
            const QRCode = (await import("qrcode")).default
            await QRCode.toCanvas(canvasRef.current, adminUIId, {
            errorCorrectionLevel: "H",
            type: "image/png",
            quality: 0.95,
            margin: 1,
            color: {
                dark: "#1e40af",
                light: "#ffffff",
            },
            })
        } catch (error) {
            console.error("QR Code generation failed:", error)
        }
        }

        generateQRCode()
    }, [adminUIId])

    return (
        <div className="flex justify-center items-center py-8">
        <div className="border-2 border-blue-300 p-4 rounded-lg bg-white">
            <canvas ref={canvasRef} />
        </div>
        </div>
    )
    }
