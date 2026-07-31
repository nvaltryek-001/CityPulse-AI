package com.example.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import java.io.ByteArrayOutputStream

/**
 * Downscales + JPEG-compresses a picked/captured photo before it goes
 * anywhere (Firebase Storage upload, Gemini inline image data). Keeps
 * uploads fast and stays well inside Gemini's inline-image size limits
 * on mobile data.
 */
object ImageUtils {

    fun uriToCompressedJpeg(
        context: Context,
        uri: Uri,
        maxDimension: Int = 1280,
        quality: Int = 82
    ): ByteArray? {
        return try {
            val input = context.contentResolver.openInputStream(uri) ?: return null
            val original = input.use { BitmapFactory.decodeStream(it) } ?: return null

            val scale = minOf(
                maxDimension.toFloat() / original.width,
                maxDimension.toFloat() / original.height,
                1f // never upscale
            )
            val scaled = if (scale < 1f) {
                Bitmap.createScaledBitmap(
                    original,
                    (original.width * scale).toInt().coerceAtLeast(1),
                    (original.height * scale).toInt().coerceAtLeast(1),
                    true
                )
            } else {
                original
            }

            ByteArrayOutputStream().use { stream ->
                scaled.compress(Bitmap.CompressFormat.JPEG, quality, stream)
                stream.toByteArray()
            }
        } catch (e: Exception) {
            null
        }
    }
}
