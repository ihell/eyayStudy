import { testGeminiAPI } from '../../lib/test-gemini';

export async function GET() {
  const result = await testGeminiAPI();
  return Response.json(result);
}