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
  meta: FilesTypes
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

export type PhotoSize = 's' | 'base'

export interface PhotoPreview<Size extends PhotoSize = PhotoSize> {
  size: Size
  width: number
  height: number
  filename: string
}

export namespace FileType {
  export interface Photo extends MetaFile {
    type: 'photo'
    origphoto: { width: number; height: number }
    previews: PhotoPreview[]
  }

  export interface Video extends MetaFile {
    type: 'video'
    first_frame: PhotoPreview[]
  }

  export interface Document extends MetaFile {
    type: 'document'
    extension: string
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
