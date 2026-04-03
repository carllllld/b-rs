// Ghost Browser Agent - Auto-apply functionality
// Playwright is loaded dynamically at runtime only when auto-apply is triggered
// It is NOT included in the build bundle

export class GhostBrowserAgent {
  private browser: any = null;
  private model: any = null;

  async initModel() {
    const { ChatOpenAI } = await import('@langchain/openai');
    this.model = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async initialize() {
    // Dynamic import - only loads when actually needed at runtime
    const pw = await import('playwright' as any);
    this.browser = await pw.chromium.launch({
      headless: true,
      slowMo: 100,
    });
  }

  async detectFormFields(page: any) {
    const fields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      return inputs.map((input: any) => ({
        type: input.type || input.tagName.toLowerCase(),
        name: input.name || '',
        id: input.id || '',
        placeholder: input.placeholder || '',
        label: input.labels?.[0]?.textContent || '',
        required: input.required || false,
        selector: input.id ? `#${input.id}` : `[name="${input.name}"]`,
      }));
    });

    return fields;
  }

  async mapCVToFields(cvData: any, fields: any[]) {
    if (!this.model) await this.initModel();

    const prompt = `You are a form-filling AI. Map CV data to form fields intelligently.

CV Data:
${JSON.stringify(cvData, null, 2)}

Form Fields:
${JSON.stringify(fields, null, 2)}

For each field, determine:
1. Which CV data should fill it
2. If it's a "tricky question" that needs a custom answer
3. The exact value to input

Respond in JSON:
{
  "mappings": [
    {
      "selector": "string",
      "value": "string",
      "source": "cv_field_name or 'generated'",
      "confidence": number
    }
  ],
  "trickyQuestions": [
    {
      "selector": "string",
      "question": "string",
      "suggestedAnswer": "string (context-aware, matches CV narrative)"
    }
  ]
}`;

    const response = await this.model.invoke(prompt);
    const content = response.content as string;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse field mappings');
    }

    return JSON.parse(jsonMatch[0]);
  }

  async fillForm(page: any, mappings: any[]) {
    for (const mapping of mappings) {
      try {
        const element = await page.locator(mapping.selector).first();
        
        if (await element.isVisible()) {
          await element.fill(mapping.value);
          await page.waitForTimeout(200);
        }
      } catch (error) {
        console.error(`Failed to fill field ${mapping.selector}:`, error);
      }
    }
  }

  async handleTrickyQuestions(page: any, trickyQuestions: any[], cvData: any) {
    for (const question of trickyQuestions) {
      try {
        const element = await page.locator(question.selector).first();
        
        if (await element.isVisible()) {
          const answer = await this.generateContextualAnswer(
            question.question,
            cvData
          );
          
          await element.fill(answer);
          await page.waitForTimeout(300);
        }
      } catch (error) {
        console.error(`Failed to answer tricky question:`, error);
      }
    }
  }

  async generateContextualAnswer(question: string, cvData: any) {
    if (!this.model) await this.initModel();

    const prompt = `Generate a compelling answer to this application question based on the candidate's CV.

Question: ${question}

CV Context:
${JSON.stringify(cvData, null, 2)}

Requirements:
- Answer must be truthful and based on CV data
- 2-3 sentences maximum
- Professional tone
- Directly addresses the question
- Highlights relevant experience

Answer:`;

    const response = await this.model.invoke(prompt);
    return (response.content as string).trim();
  }

  async navigateAndApply(jobUrl: string, cvData: any, applicationId: string) {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser.newPage();

    try {
      await this.logAction(applicationId, 'NAVIGATION_START', `Navigating to ${jobUrl}`);
      await page.goto(jobUrl, { waitUntil: 'networkidle' });

      await this.logAction(applicationId, 'FORM_DETECTION', 'Detecting form fields...');
      const fields = await this.detectFormFields(page);

      await this.logAction(applicationId, 'FIELD_MAPPING', `Found ${fields.length} fields`);
      const { mappings, trickyQuestions } = await this.mapCVToFields(cvData, fields);

      await this.logAction(applicationId, 'FORM_FILLING', 'Filling standard fields...');
      await this.fillForm(page, mappings);

      if (trickyQuestions.length > 0) {
        await this.logAction(
          applicationId,
          'TRICKY_QUESTIONS',
          `Answering ${trickyQuestions.length} custom questions...`
        );
        await this.handleTrickyQuestions(page, trickyQuestions, cvData);
      }

      await this.logAction(applicationId, 'FORM_COMPLETE', 'Form filled successfully');

      await page.waitForTimeout(2000);

      return {
        success: true,
        fieldsFound: fields.length,
        fieldsFilled: mappings.length,
        trickyQuestionsAnswered: trickyQuestions.length,
      };
    } catch (error) {
      await this.logAction(applicationId, 'ERROR', `Failed: ${error}`);
      throw error;
    } finally {
      await page.close();
    }
  }

  async logAction(applicationId: string, action: string, message: string) {
    const { supabase } = await import('@/lib/supabase/client');
    await supabase.from('agent_logs').insert({
      cv_version_id: applicationId,
      agent_name: 'GHOST_BROWSER',
      action,
      message,
      metadata: { timestamp: new Date().toISOString() },
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
