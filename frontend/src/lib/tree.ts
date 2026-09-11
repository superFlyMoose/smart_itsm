interface TreeNode {
  id: number
  name: string
  children?: TreeNode[]
}

export interface FlatOption {
  id: number
  name: string
  /** 顶层深度为 0，用于缩进展示 */
  depth: number
}

/** 将分类/部门树扁平化为带层级缩进的下拉选项 */
export function flattenTree(nodes: TreeNode[] | undefined | null): FlatOption[] {
  const result: FlatOption[] = []
  const walk = (list: TreeNode[], depth: number) => {
    list.forEach((node) => {
      result.push({ id: node.id, name: node.name, depth })
      if (node.children?.length) walk(node.children, depth + 1)
    })
  }
  if (nodes) walk(nodes, 0)
  return result
}
