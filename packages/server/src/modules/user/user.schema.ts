import {
  DocumentType,
  getModelForClass,
  modelOptions,
  plugin,
  prop,
  ReturnModelType,
} from '@typegoose/typegoose'
import bcrypt from 'bcrypt'
import uniqueValidator from 'mongoose-unique-validator'
import { UserState } from 'common/modules/user/redux'

@modelOptions({
  options: {
    customName: 'User',
  },
})
@plugin(uniqueValidator)
export class UserSchema implements UserState {
  _id!: string

  @prop({ required: true, unique: true, select: false })
  email!: string

  @prop({ required: true, unique: true })
  login!: string

  @prop({ required: true, select: false })
  passwordHash!: string

  async setPassword(password: string) {
    this.passwordHash = await bcrypt.hash(password, 10)
  }

  async checkPassword(password: string) {
    return await bcrypt.compare(password, this.passwordHash)
  }

  static async findByLogin(
    this: ReturnModelType<typeof UserSchema>,
    login: string,
  ) {
    const user = await this.findOne({ login }).exec()
    return user as UserDocument | null
  }

  toObject!: () => UserObject
}

export type UserDocument = Omit<DocumentType<UserSchema>, 'toObject'> & {
  toObject: () => UserObject
}

export type UserObject = Omit<UserDocument, '_id'> & { _id: string }

export const UserModel = getModelForClass(UserSchema)
