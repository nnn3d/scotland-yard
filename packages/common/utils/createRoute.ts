import { Join } from '../types/Join'
import { PathParams } from '../types/PathParams'

export function createRoute<Paths extends string[]>(...paths: Paths) {
  const path = paths[paths.length - 1]
  const linkPath = paths.join('/').replace(/\/\/+/g, '/')

  type LinkPath = Join<Paths, '/'>
  type Params = PathParams<LinkPath>
  type LinkParams = Record<Params, string>
  type Link = Params extends never
    ? () => string
    : (params: LinkParams) => string

  return {
    path,
    linkPath: linkPath as LinkPath,
    toString: () => path,
    link: ((params: LinkParams) => {
      if (!params) {
        return linkPath
      }
      return (Object.entries(params) as Array<[string, string]>).reduce(
        (link, [key, value]) => link.replace(':' + key, value),
        linkPath,
      )
    }) as Link,
  }
}

export type RouteParams<Route extends { linkPath: string }> = {
  [K in PathParams<Route['linkPath']>]: string
}
