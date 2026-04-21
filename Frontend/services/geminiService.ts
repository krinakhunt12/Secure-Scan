
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult } from "../../types";

// Fix: Move GoogleGenAI instance creation inside analyzeUrl to ensure the latest API key is used
// and adhere to strict guideline regarding process.env.API_KEY usage.
export const analyzeUrl = async (url: string): Promise<ScanResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const response = await ai.models.generateContent({
    // Fix: Using 'gemini-3-pro-preview' as security analysis is a complex reasoning task.
    model: "gemini-3-pro-preview",
    contents: `Perform a detailed simulated security analysis for the URL: ${url}. 
    Provide technical but simulated data based on common configurations for such sites.
    Include a "threatIntel" section with 3-5 simulated real-time security alerts or known vulnerabilities (like CVEs) relevant to the technology likely used by this domain (e.g., WordPress vulnerabilities, Apache/Nginx issues, or generic phishing/malware campaign alerts).
    For each threat, provide a "remediation" string with clear, professional steps to fix the issue.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Security score from 0 to 100" },
          riskLevel: { type: Type.STRING, description: "Low, Medium, or High" },
          ssl: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              issuer: { type: Type.STRING },
              expiryDate: { type: Type.STRING },
              daysRemaining: { type: Type.NUMBER }
            },
            required: ["status", "issuer", "expiryDate", "daysRemaining"]
          },
          headers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                present: { type: Type.BOOLEAN },
                value: { type: Type.STRING }
              },
              required: ["name", "present"]
            }
          },
          domain: {
            type: Type.OBJECT,
            properties: {
              ipAddress: { type: Type.STRING },
              hostingServer: { type: Type.STRING },
              domainAge: { type: Type.STRING },
              domainAgeYears: { type: Type.NUMBER, description: "The age of the domain in years as a float or integer" },
              expiryDate: { type: Type.STRING }
            },
            required: ["ipAddress", "hostingServer", "domainAge", "domainAgeYears", "expiryDate"]
          },
          ports: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                port: { type: Type.NUMBER },
                service: { type: Type.STRING },
                status: { type: Type.STRING }
              },
              required: ["port", "service", "status"]
            }
          },
          threatIntel: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                severity: { type: Type.STRING, description: "Critical, High, Medium, or Info" },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                source: { type: Type.STRING },
                remediation: { type: Type.STRING, description: "Professional remediation steps" }
              },
              required: ["id", "severity", "title", "description", "source", "remediation"]
            }
          }
        },
        required: ["score", "riskLevel", "ssl", "headers", "domain", "ports", "threatIntel"]
      }
    }
  });

  // Fix: Directly accessing .text property (not a method) as per guidelines.
  const rawJson = JSON.parse(response.text || '{}');
  
  return {
    url,
    timestamp: new Date().toISOString(),
    ...rawJson
  } as ScanResult;
};
