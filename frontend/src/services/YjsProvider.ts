# /path/to/PyDraGo/frontend/src/services/YjsProvider.ts
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Node, Edge } from 'reactflow';

export interface YjsSync {
  provider: WebsocketProvider;
  doc: Y.Doc;
  nodes: Y.Array<Node>;
  edges: Y.Array<Edge>;
  awareness: any;
  disconnect: () => void;
}

export class YjsProvider {
  private static WS_URL = `ws://${window.location.host}/ws/diagram`;

  static connect(diagramId: string): YjsSync {
    const doc = new Y.Doc();
    const provider = new WebsocketProvider(
      this.WS_URL,
      diagramId,
      doc,
      { connect: true }
    );

    const ymap = doc.getMap('diagram');

    // Initialize nodes and edges arrays if they don't exist
    if (!ymap.get('nodes')) {
      ymap.set('nodes', new Y.Array());
    }
    if (!ymap.get('edges')) {
      ymap.set('edges', new Y.Array());
    }

    const nodes = ymap.get('nodes') as Y.Array<Node>;
    const edges = ymap.get('edges') as Y.Array<Edge>;
    const awareness = provider.awareness;

    const disconnect = () => {
      provider.disconnect();
      doc.destroy();
    };

    return { provider, doc, nodes, edges, awareness, disconnect };
  }
}