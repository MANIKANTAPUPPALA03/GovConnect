"""
Document Analyzer using Azure Document Intelligence

Analyzes uploaded forms using Azure Document Intelligence (Form Recognizer)
and extracts form fields for AI guidance.
"""
from typing import Optional, List
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

from app.config import get_settings


class DocumentAnalyzer:
    """Client for Azure Document Intelligence."""
    
    def __init__(self):
        settings = get_settings()
        self.endpoint = settings.doc_intelligence_endpoint
        self.key = settings.doc_intelligence_key
        self.client = None
        
        if self.endpoint and self.key:
            self.client = DocumentAnalysisClient(
                endpoint=self.endpoint,
                credential=AzureKeyCredential(self.key)
            )
    
    @property
    def is_configured(self) -> bool:
        """Check if Document Intelligence is properly configured."""
        return self.client is not None and bool(self.endpoint) and bool(self.key)
    
    async def analyze_document(self, file_bytes: bytes, file_type: str = "application/pdf") -> dict:
        """
        Analyze a document and extract form fields.
        
        Args:
            file_bytes: The document content as bytes
            file_type: MIME type of the document
            
        Returns:
            Dictionary with extracted fields and document info
        """
        if not self.is_configured:
            return {
                "success": False,
                "error": "Document Intelligence not configured",
                "fields": []
            }
        
        try:
            # Use prebuilt-document model for general form analysis
            poller = self.client.begin_analyze_document(
                "prebuilt-document",
                document=file_bytes
            )
            result = poller.result()
            
            # Extract key-value pairs
            fields = []
            if result.key_value_pairs:
                for kv in result.key_value_pairs:
                    if kv.key and kv.key.content:
                        field = {
                            "name": kv.key.content.strip(),
                            "value": kv.value.content.strip() if kv.value else "",
                            "confidence": kv.confidence if hasattr(kv, 'confidence') else None
                        }
                        fields.append(field)
            
            # Extract tables if any
            tables = []
            if result.tables:
                for table in result.tables:
                    table_data = {
                        "row_count": table.row_count,
                        "column_count": table.column_count,
                        "cells": [
                            {
                                "row": cell.row_index,
                                "column": cell.column_index,
                                "content": cell.content
                            }
                            for cell in table.cells
                        ]
                    }
                    tables.append(table_data)
            
            # Extract paragraphs for context
            paragraphs = []
            if result.paragraphs:
                for para in result.paragraphs[:10]:  # Limit to first 10
                    paragraphs.append(para.content)
            
            return {
                "success": True,
                "fields": fields,
                "tables": tables,
                "paragraphs": paragraphs,
                "page_count": len(result.pages) if result.pages else 0
            }
            
        except Exception as e:
            print(f"[Document Analyzer] Error: {e}")
            return {
                "success": False,
                "error": str(e),
                "fields": []
            }


# Global instance
_doc_analyzer: Optional[DocumentAnalyzer] = None


def get_document_analyzer() -> DocumentAnalyzer:
    """Get or create Document Analyzer instance."""
    global _doc_analyzer
    if _doc_analyzer is None:
        _doc_analyzer = DocumentAnalyzer()
    return _doc_analyzer
