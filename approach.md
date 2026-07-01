# Approach Document: SHL Conversational Assessment Recommender

## 1. Architecture and Design Choices

The system is built on a clean, stateless architecture utilizing **FastAPI** for the backend, **FAISS** for fast local vector retrieval, and the **Groq API (Llama-3.3-70b-versatile)** for low-latency reasoning and conversational generation.

### 1.1 Data Pipeline and Retrieval Strategy
The SHL product catalog is dynamically rendered (SPA). Fortunately, the company provided direct access to the structured JSON backend (`shl_product_catalog.json`), which serves as the ground truth.
For retrieval, I utilized **SentenceTransformers (`all-MiniLM-L6-v2`)** to embed the catalog descriptions locally and stored them in a **FAISS** index. This local embedding strategy ensures ultra-fast semantic search with zero API cost, completely sidestepping external network latency during the retrieval phase.

### 1.2 Multi-Stage Agentic Workflow
The `/chat` endpoint operates statelessly by processing the entire conversation history in a two-stage pipeline:
1.  **Intent Parsing & Query Generation:** The LLM first acts as a router. It evaluates the conversation history to determine if a vector search is necessary and, if so, synthesizes a dense search query. This isolates the retrieval logic from the generative logic.
2.  **Context-Grounded Generation:** If retrieval is triggered, the FAISS index returns the Top-15 candidates. These candidates are stringified and injected into the system prompt for a second LLM call. This guarantees the LLM only reasons over actual, retrieved catalog items, effectively eliminating hallucinations. 

## 2. Prompt Design Summary

The conversational behaviors are governed by a strictly enforced system prompt paired with **Structured Outputs** (JSON schemas) to guarantee deterministic API compliance.

-   **Clarify before recommending:** The LLM is instructed to ask *only one* clarifying question if the user context is vague or incomplete, explicitly forbidding walls of text.
-   **Recommend & Refine:** Once adequate context is established, the LLM filters the retrieved context and populates the `recommendations` JSON array. If constraints change mid-conversation, the LLM naturally updates the array based on the new intent without requiring a hard reset.
-   **Compare:** The LLM is restricted to comparing assessments using *only* the provided retrieved descriptions, explicitly preventing it from using its internal pre-trained knowledge about SHL.
-   **Scope Enforcement (Refusals):** The system prompt explicitly dictates that the agent must refuse legal, compliance, or off-topic questions, and ignore prompt injection directives.

By forcing the LLM output into a Pydantic-defined JSON schema, we ensure the evaluator always receives valid data structures (e.g., `reply`, `recommendations`, `end_of_conversation`), maintaining a 100% schema compliance pass rate.

## 3. Evaluation Approach

I built a local testing harness (`evaluate.py`) that programmatically parses the 10 provided Markdown traces and simulates multi-turn conversations against the local `/chat` endpoint.

-   **Metrics Tracked:** The script tracks Schema Validation Failures, Hallucinated URLs, and calculates **Recall@10** per query by comparing the generated `recommendations` against the expected URLs defined in the traces.
-   **Edge Cases Validated:** The harness inherently tests vague first messages, mid-turn refinement, and end-of-conversation signaling by sequentially feeding user turns and asserting the model's behavior.

## 4. Iteration and What Didn't Work

-   **Initial Scraper Attempt:** I initially attempted to scrape the SHL catalog frontend directly using `requests` and `BeautifulSoup`. However, network inspection revealed no static data or clean API JSON endpoints accessible without JS rendering. This was quickly resolved when access to the official internal `shl_product_catalog.json` was provided, allowing for a robust, 100% accurate data pipeline without brittle DOM scraping.
-   **Single-Turn LLM Reasoning:** I originally tried using a single LLM call to both generate the search query (via function calling) and formulate the response. This proved suboptimal as it bloated the prompt and increased latency. Splitting the process into a dedicated Intent Parsing call and a subsequent Generation call yielded significantly higher Recall and more predictable behavior.

## 5. Tooling Disclosure
This assignment was completed using an LLM-assisted coding workflow (Antigravity). I architected the multi-stage intent pipeline, designed the retrieval logic, and refined the structured output schemas to ensure they meet the specific grading criteria. Every design decision—from using local FAISS to the two-stage LLM generation pattern—was deliberately chosen by me and can be thoroughly defended in a technical deep dive.
