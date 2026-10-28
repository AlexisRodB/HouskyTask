export class ITaskRepository {
  async save(task) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED: save()");
  }

  async findAll() {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED: findAll()");
  }

  async findById(id) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED: findById()");
  }

  async delete(id) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED: delete()");
  }
}