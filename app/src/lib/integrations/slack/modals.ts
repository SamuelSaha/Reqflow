/**
 * Slack Modal & Message Builders
 * Generates Slack Block Kit JSON for modals and messages
 */

/**
 * Build request form modal view
 * @returns Slack Block Kit modal view
 */
export function buildRequestModal() {
  return {
    type: "modal",
    callback_id: "request_submission",
    title: { type: "plain_text", text: "New Purchase Request" },
    submit: { type: "plain_text", text: "Submit" },
    close: { type: "plain_text", text: "Cancel" },
    blocks: [
      // Title
      {
        type: "input",
        block_id: "title_block",
        label: { type: "plain_text", text: "Title" },
        element: {
          type: "plain_text_input",
          action_id: "title",
          placeholder: {
            type: "plain_text",
            text: "e.g., Figma Professional subscription",
          },
          min_length: 3,
        },
      },
      // Description
      {
        type: "input",
        block_id: "description_block",
        optional: true,
        label: { type: "plain_text", text: "Description (optional)" },
        element: {
          type: "plain_text_input",
          action_id: "description",
          multiline: true,
          placeholder: {
            type: "plain_text",
            text: "Why do you need this?",
          },
        },
      },
      // Category
      {
        type: "input",
        block_id: "category_block",
        label: { type: "plain_text", text: "Category" },
        element: {
          type: "static_select",
          action_id: "category",
          placeholder: { type: "plain_text", text: "Select category" },
          options: [
            {
              text: { type: "plain_text", text: "SaaS / Software" },
              value: "saas",
            },
            {
              text: { type: "plain_text", text: "Services / Consulting" },
              value: "services",
            },
            {
              text: { type: "plain_text", text: "Office Supplies" },
              value: "office",
            },
            {
              text: { type: "plain_text", text: "Travel & Events" },
              value: "travel",
            },
            {
              text: { type: "plain_text", text: "Hardware / Equipment" },
              value: "hardware",
            },
            { text: { type: "plain_text", text: "Other" }, value: "other" },
          ],
        },
      },
      // Vendor
      {
        type: "input",
        block_id: "vendor_block",
        optional: true,
        label: { type: "plain_text", text: "Vendor (optional)" },
        element: {
          type: "plain_text_input",
          action_id: "vendor_name",
          placeholder: { type: "plain_text", text: "e.g., Figma, Inc." },
        },
      },
      // Amount
      {
        type: "input",
        block_id: "amount_block",
        label: { type: "plain_text", text: "Amount (EUR)" },
        element: {
          type: "plain_text_input",
          action_id: "amount",
          placeholder: { type: "plain_text", text: "0.00" },
        },
      },
      // Frequency
      {
        type: "input",
        block_id: "frequency_block",
        label: { type: "plain_text", text: "Frequency" },
        element: {
          type: "static_select",
          action_id: "frequency",
          initial_option: {
            text: { type: "plain_text", text: "One-time" },
            value: "one-time",
          },
          options: [
            {
              text: { type: "plain_text", text: "One-time" },
              value: "one-time",
            },
            {
              text: { type: "plain_text", text: "Monthly" },
              value: "monthly",
            },
            {
              text: { type: "plain_text", text: "Annually" },
              value: "annually",
            },
          ],
        },
      },
      // Urgency
      {
        type: "input",
        block_id: "urgency_block",
        label: { type: "plain_text", text: "Urgency" },
        element: {
          type: "static_select",
          action_id: "urgency",
          initial_option: {
            text: { type: "plain_text", text: "Normal" },
            value: "normal",
          },
          options: [
            { text: { type: "plain_text", text: "Low" }, value: "low" },
            { text: { type: "plain_text", text: "Normal" }, value: "normal" },
            { text: { type: "plain_text", text: "Urgent" }, value: "urgent" },
          ],
        },
      },
    ],
  };
}

/**
 * Build success message for request submission
 * @param requestNumber - Generated request number (REQ-2026-0001)
 * @param workflowName - Approval workflow name
 * @param approvers - Number of approval steps
 * @returns Slack message payload
 */
export function buildSuccessMessage(
  requestNumber: string,
  workflowName: string,
  approvers: number
) {
  return {
    response_type: "ephemeral",
    text: `Your request ${requestNumber} has been submitted!`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:white_check_mark: *Request ${requestNumber} submitted successfully!*`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Workflow:*\n${workflowName}` },
          {
            type: "mrkdwn",
            text: `*Approvers:*\n${approvers} step${approvers !== 1 ? "s" : ""}`,
          },
        ],
      },
    ],
  };
}

/**
 * Build error message
 * @param error - Error message text
 * @returns Slack message payload
 */
export function buildErrorMessage(error: string) {
  return {
    response_type: "ephemeral",
    text: "Failed to create request",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:x: *Failed to create request*\n${error}`,
        },
      },
    ],
  };
}

/**
 * Build validation error message
 * @param field - Field name that failed validation
 * @param error - Validation error message
 * @returns Slack message payload
 */
export function buildValidationErrorMessage(field: string, error: string) {
  return {
    response_type: "ephemeral",
    text: "Validation error",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:warning: *Invalid ${field}*\n${error}\n\n_Try using the full form: \`/request\` (no text)_`,
        },
      },
    ],
  };
}
