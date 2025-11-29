// src/services/sentimentAnalysis.ts
export interface SentimentResult {
  mood: MoodType
  intensity: number
  confidence: number
  emotions: string[]
  dominantEmotion: string
}

export class SentimentAnalyzer {
  private providers = {
    openai: this.analyzeWithOpenAI.bind(this),
    huggingface: this.analyzeWithHuggingFace.bind(this),
    google: this.analyzeWithGoogleNLP.bind(this)
  }

  async analyzeText(text: string, provider: keyof typeof this.providers = 'openai'): Promise<SentimentResult> {
    try {
      return await this.providers[provider](text)
    } catch (error) {
      console.warn(`${provider} failed, falling back to local analysis`)
      return this.analyzeLocally(text)
    }
  }

  private async analyzeWithOpenAI(text: string): Promise<SentimentResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: `Analyze the sentiment and emotional tone of the following text. 
                   Return JSON with: mood (creative/melancholy/energetic/neutral), 
                   intensity (0-1), confidence (0-1), emotions array, dominantEmotion.`
        }, {
          role: 'user',
          content: text
        }]
      })
    })

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  }

  private async analyzeWithHuggingFace(text: string): Promise<SentimentResult> {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base',
      {
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_HF_KEY}` },
        method: 'POST',
        body: JSON.stringify({ inputs: text })
      }
    )
    
    const data = await response.json()
    return this.mapHuggingFaceToMood(data[0])
  }

  private analyzeLocally(text: string): SentimentResult {
    // Advanced local analysis with emotion lexicon
    const emotionLexicon = {
      creative: ['create', 'invent', 'design', 'imagine', 'inspire', 'creative', 'artistic'],
      happy: ['happy', 'joy', 'excited', 'wonderful', 'amazing', 'great'],
      sad: ['sad', 'unhappy', 'depressed', 'melancholy', 'blue', 'down'],
      energetic: ['energy', 'active', 'dynamic', 'vibrant', 'lively', 'powerful'],
      calm: ['calm', 'peaceful', 'serene', 'tranquil', 'relaxed', 'quiet']
    }

    const words = text.toLowerCase().split(/\W+/)
    const scores = { creative: 0, melancholy: 0, energetic: 0, neutral: 0 }
    
    words.forEach(word => {
      Object.entries(emotionLexicon).forEach(([emotion, keywords]) => {
        if (keywords.includes(word)) {
          const mood = this.mapEmotionToMood(emotion)
          scores[mood]++
        }
      })
    })

    const maxMood = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)
    
    return {
      mood: maxMood[0] as MoodType,
      intensity: Math.min(maxMood[1] / words.length * 10, 1),
      confidence: Math.min(maxMood[1] / 5, 1),
      emotions: this.detectEmotions(words, emotionLexicon),
      dominantEmotion: this.getDominantEmotion(scores)
    }
  }
}