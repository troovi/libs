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
  size: number
}

export namespace FileType {
  export interface Photo extends Omit<MetaFile, 'originalname'> {
    type: 'photo'
    width: number
    height: number
    originalname?: string
  }

  export interface Video extends MetaFile {
    type: 'video'
    firstframe: string
  }

  export interface Document extends MetaFile {
    type: 'document'
  }
}

export type FilesTypes = FileType.Photo | FileType.Video | FileType.Document
export type AttachmentType<T extends FilesTypes['type']> = T extends 'photo'
  ? FileType.Photo
  : T extends 'video'
  ? FileType.Video
  : T extends 'document'
  ? FileType.Document
  : never
