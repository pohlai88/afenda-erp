export type EngagementNotificationChannelMessage = {
  readonly title: string
  readonly body: string
}

export type EngagementEmailTemplateMessage = {
  readonly subject: string
  readonly text: string
  readonly html: string
}

export type EngagementNotificationTemplateMessage = {
  readonly inApp: EngagementNotificationChannelMessage
  readonly email: EngagementEmailTemplateMessage
}

function emailHtml(lines: readonly string[]): string {
  return lines.map((line) => `<p>${line}</p>`).join("")
}

export function buildEngagementSurveyInvitationTemplate(input: {
  readonly surveyTitle: string
  readonly respondUrl: string
}): EngagementNotificationTemplateMessage {
  const inAppBody = `You have been invited to complete: ${input.surveyTitle}.`
  return {
    inApp: {
      title: `Employee engagement survey: ${input.surveyTitle}`,
      body: inAppBody,
    },
    email: {
      subject: `Employee engagement survey: ${input.surveyTitle}`,
      text: [
        "Afenda Employee Engagement",
        inAppBody,
        `Respond to the survey: ${input.respondUrl}`,
      ].join("\n"),
      html: emailHtml([
        "<strong>Afenda Employee Engagement</strong>",
        inAppBody,
        `<a href="${input.respondUrl}">Respond to the survey</a>`,
      ]),
    },
  }
}

export function buildEngagementSurveyReminderTemplate(input: {
  readonly surveyTitle: string
  readonly daysBeforeClose: number
  readonly respondUrl: string
}): EngagementNotificationTemplateMessage {
  const inAppBody = `Your engagement survey closes in ${input.daysBeforeClose} day(s). Please submit your response.`
  return {
    inApp: {
      title: `Survey reminder: ${input.surveyTitle}`,
      body: inAppBody,
    },
    email: {
      subject: `Survey reminder: ${input.surveyTitle}`,
      text: [
        "Afenda Employee Engagement",
        inAppBody,
        `Respond to the survey: ${input.respondUrl}`,
      ].join("\n"),
      html: emailHtml([
        "<strong>Afenda Employee Engagement</strong>",
        inAppBody,
        `<a href="${input.respondUrl}">Respond to the survey</a>`,
      ]),
    },
  }
}

export function buildEngagementSurveyResendTemplate(input: {
  readonly surveyTitle: string
  readonly respondUrl: string
}): EngagementNotificationTemplateMessage {
  const inAppBody = `Reminder: please complete your employee engagement survey invitation.`
  return {
    inApp: {
      title: `Survey invitation reminder: ${input.surveyTitle}`,
      body: inAppBody,
    },
    email: {
      subject: `Reminder: ${input.surveyTitle}`,
      text: [
        "Afenda Employee Engagement",
        inAppBody,
        `Respond to the survey: ${input.respondUrl}`,
      ].join("\n"),
      html: emailHtml([
        "<strong>Afenda Employee Engagement</strong>",
        inAppBody,
        `<a href="${input.respondUrl}">Respond to the survey</a>`,
      ]),
    },
  }
}

export function buildEngagementImprovementOverdueTemplate(input: {
  readonly title: string
  readonly dueDate: string | null
  readonly surveyUrl: string
}): EngagementNotificationTemplateMessage {
  const dueLine = input.dueDate
    ? `The action "${input.title}" was due ${input.dueDate}.`
    : `The action "${input.title}" is overdue.`
  return {
    inApp: {
      title: "Improvement action overdue",
      body: dueLine,
    },
    email: {
      subject: `Improvement action overdue: ${input.title}`,
      text: [
        "Afenda Employee Engagement",
        dueLine,
        `View survey: ${input.surveyUrl}`,
      ].join("\n"),
      html: emailHtml([
        "<strong>Afenda Employee Engagement</strong>",
        dueLine,
        `<a href="${input.surveyUrl}">View survey and actions</a>`,
      ]),
    },
  }
}
