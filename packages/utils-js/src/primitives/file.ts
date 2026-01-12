export type FileStages = 'assigned' | 'evaluated' | 'empthy'

export type FileFormat<T extends FileStages = FileStages> = T extends 'assigned'
  ? FileAssigned
  : T extends 'evaluated'
  ? FileEvaluated
  : T extends 'empthy'
  ? FileEmpthy
  : never

export interface FileAssigned {
  stage: 'assigned'
  meta: MetaFile
}

export interface FileEvaluated {
  stage: 'evaluated'
  blob: File
}

export interface FileEmpthy {
  stage: 'empthy'
}

export interface MetaFile {
  filename: string
  originalname: string
}
