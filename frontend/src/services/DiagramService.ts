# /path/to/PyDraGo/frontend/src/services/DiagramService.ts
import { Node, Edge } from 'reactflow';

export interface Diagram {
  id: string;
  name: string;
  description: string;
  json_data?: {
    nodes: Node[];
    edges: Edge[];
  };
  created_at: string;
  updated_at: string;
}

export class DiagramService {
  private static API_URL = '/api/diagrams';

  static async getAllDiagrams(): Promise<Diagram[]> {
    const response = await fetch(this.API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch diagrams: ${response.statusText}`);
    }
    return response.json();
  }

  static async getDiagram(id: string): Promise<Diagram> {
    const response = await fetch(`${this.API_URL}/${id}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch diagram: ${response.statusText}`);
    }
    return response.json();
  }

  static async createDiagram(diagram: Partial<Diagram>): Promise<Diagram> {
    const response = await fetch(this.API_URL + '/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diagram),
    });
    if (!response.ok) {
      throw new Error(`Failed to create diagram: ${response.statusText}`);
    }
    return response.json();
  }

  static async updateDiagram(id: string, diagram: Partial<Diagram>): Promise<Diagram> {
    const response = await fetch(`${this.API_URL}/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diagram),
    });
    if (!response.ok) {
      throw new Error(`Failed to update diagram: ${response.statusText}`);
    }
    return response.json();
  }

  static async deleteDiagram(id: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete diagram: ${response.statusText}`);
    }
  }

  static async importDiagram(id: string, jsonData: any): Promise<void> {
    const response = await fetch(`${this.API_URL}/${id}/import_json/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    });
    if (!response.ok) {
      throw new Error(`Failed to import diagram: ${response.statusText}`);
    }
  }

  static async exportDiagram(id: string): Promise<any> {
    const response = await fetch(`${this.API_URL}/${id}/export_json/`);
    if (!response.ok) {
      throw new Error(`Failed to export diagram: ${response.statusText}`);
    }
    return response.json();
  }
}