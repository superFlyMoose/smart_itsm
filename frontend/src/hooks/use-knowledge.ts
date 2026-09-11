import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { knowledgeApi } from '@/api/knowledge'
import { queryKeys } from './query-keys'
import type { KnowledgeCreateRequest, KnowledgeQuery } from '@/types/knowledge'

export function useKnowledgeList(query: KnowledgeQuery) {
  return useQuery({
    queryKey: queryKeys.knowledge.list(query),
    queryFn: () => knowledgeApi.page(query),
  })
}

export function useKnowledgeDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.knowledge.detail(id),
    queryFn: () => knowledgeApi.detail(id),
  })
}

export function useKnowledgeMutations() {
  const qc = useQueryClient()
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['knowledge'] })

  const create = useMutation({
    mutationFn: (data: KnowledgeCreateRequest) => knowledgeApi.create(data),
    onSuccess: invalidate,
  })

  const publish = useMutation({
    mutationFn: (id: number) => knowledgeApi.publish(id),
    onSuccess: invalidate,
  })

  const offline = useMutation({
    mutationFn: (id: number) => knowledgeApi.offline(id),
    onSuccess: invalidate,
  })

  return { create, publish, offline }
}
