type Item = Omit<StaticRange, "endContainer" | "collapsed">;

export class TextNodeMap {
  private colection: Item[] = [];
  private content = "";

  collect(node: Text) {
    const value = (node.nodeValue ?? "").toLowerCase();
    if (!value.length) return;

    const index = this.content.length;

    this.colection.push({
      startOffset: index,
      endOffset: index + value.length,
      startContainer: node,
    });

    this.content += value;
  }

  get read(): string {
    return this.content;
  }

  findNodeAtOffset(offset: number): Item | null {
    let left = 0;
    let right = this.colection.length;

    while (left < right) {
      const mid = (left + right) >> 1;
      if (this.colection[mid].startOffset <= offset) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    const node = this.colection[left - 1];
    return node && offset < node.endOffset ? node : null;
  }
}
