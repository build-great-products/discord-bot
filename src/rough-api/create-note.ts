import { errorBoundary } from '@stayradiated/error-boundary'

import type { Note } from './types.js'

type CreateNoteOptions = {
  apiToken: string
  title: string
  content: string
  createdByUserId: string
}

const createNote = async (
  options: CreateNoteOptions,
): Promise<Note | Error> => {
  const { apiToken, title, content, createdByUserId } = options

  return errorBoundary(async () => {
    const response = await fetch('https://in.rough.app/api/v1/note', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content,
        createdByUserId,
      }),
    })
    if (!response.ok) {
      return new Error(
        `Failed to create note: ${response.status} ${response.statusText}`,
      )
    }
    return response.json() as Promise<Note>
  })
}

export { createNote }
