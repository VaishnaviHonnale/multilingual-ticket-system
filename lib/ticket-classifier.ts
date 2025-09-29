interface ClassificationResult {
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  suggestedAgent?: string
  confidence: number
}

export async function classifyTicket(description: string, language = "en"): Promise<ClassificationResult> {
  try {
    // This is a simplified classification system
    // In a real implementation, you would use AI/ML services

    const lowercaseDesc = description.toLowerCase()

    // Priority classification based on keywords
    let priority: ClassificationResult["priority"] = "medium"

    if (lowercaseDesc.includes("urgent") || lowercaseDesc.includes("critical") || lowercaseDesc.includes("emergency")) {
      priority = "urgent"
    } else if (
      lowercaseDesc.includes("important") ||
      lowercaseDesc.includes("asap") ||
      lowercaseDesc.includes("high priority")
    ) {
      priority = "high"
    } else if (
      lowercaseDesc.includes("minor") ||
      lowercaseDesc.includes("low priority") ||
      lowercaseDesc.includes("when possible")
    ) {
      priority = "low"
    }

    // Category classification based on keywords
    let category = "general"

    if (lowercaseDesc.includes("bug") || lowercaseDesc.includes("error") || lowercaseDesc.includes("broken")) {
      category = "bug"
    } else if (
      lowercaseDesc.includes("feature") ||
      lowercaseDesc.includes("enhancement") ||
      lowercaseDesc.includes("improvement")
    ) {
      category = "feature"
    } else if (
      lowercaseDesc.includes("billing") ||
      lowercaseDesc.includes("payment") ||
      lowercaseDesc.includes("invoice")
    ) {
      category = "billing"
    } else if (
      lowercaseDesc.includes("technical") ||
      lowercaseDesc.includes("api") ||
      lowercaseDesc.includes("integration")
    ) {
      category = "technical"
    } else if (
      lowercaseDesc.includes("support") ||
      lowercaseDesc.includes("help") ||
      lowercaseDesc.includes("question")
    ) {
      category = "support"
    }

    return {
      priority,
      category,
      confidence: 0.8, // Mock confidence score
    }
  } catch (error) {
    console.error("Error classifying ticket:", error)

    // Return default classification on error
    return {
      priority: "medium",
      category: "general",
      confidence: 0.5,
    }
  }
}
