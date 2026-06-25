import { apiGet, withMockFallback } from "@/services/api-client"
import type { ParserProfile } from "@/types/parser-profile"

export function listParserProfiles() {
  return withMockFallback(
    apiGet<ParserProfile[]>("/parser-profiles"),
    () => mockParserProfiles
  )
}

const mockParserProfiles: ParserProfile[] = [
  {
    parserProfile: "feishu_article_v1",
    displayName: "飞书文章解析 Profile",
    supportedRawMaterialTypes: ["document_snapshot"],
    supportedSourceTypes: ["feishu"],
    contentFormat: "markdown",
    enabled: true,
    version: "v1",
  },
  {
    parserProfile: "pdf_manual_article_v1",
    displayName: "PDF 手册解析 Profile",
    supportedRawMaterialTypes: ["file"],
    supportedSourceTypes: ["pdf"],
    contentFormat: "markdown",
    enabled: true,
    version: "v1",
  },
  {
    parserProfile: "excel_fee_table_v1",
    displayName: "Excel 收费表解析 Profile",
    supportedRawMaterialTypes: ["file", "table_extract"],
    supportedSourceTypes: ["excel"],
    contentFormat: "structured_table",
    enabled: true,
    version: "v1",
  },
]
