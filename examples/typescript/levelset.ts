// Call Levelset from TypeScript with an API key. No dependencies: Node 22.6+ runs this file directly.
//
//   export LEVELSET_API_KEY=spk_...   # Account, Security on standpointhq.com
//   node levelset.ts NVDA

const ENDPOINT = 'https://standpointhq.com/api/v1/mcp';

type ToolResult = {
  content: { type: 'text'; text: string }[];
  structuredContent?: unknown;
  isError?: boolean;
};

/** Run one Levelset tool and return its structured result. */
export async function call(tool: string, args: Record<string, unknown> = {}): Promise<unknown> {
  const key = process.env.LEVELSET_API_KEY;
  if (!key) throw new Error('Set LEVELSET_API_KEY to a key made under Account, Security on standpointhq.com.');

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: tool, arguments: args } }),
  });
  if (!response.ok) throw new Error(`Levelset answered ${response.status}: ${(await response.text()).slice(0, 200)}`);

  const reply = (await response.json()) as { result?: ToolResult; error?: { message: string } };
  if (reply.error) throw new Error(`Levelset error: ${reply.error.message}`);
  if (reply.result!.isError) throw new Error(`Tool error: ${reply.result!.content[0].text}`);
  return reply.result!.structuredContent;
}

const ticker = process.argv[2] ?? 'NVDA';

try {
  console.log(JSON.stringify(await call('ticker_profile', { ticker }), null, 2).slice(0, 2000));
  console.log(JSON.stringify(await call('picks_record', { book: 'sp' }), null, 2).slice(0, 2000));
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
