import { isPromise } from "util/types"

abstract class ImportantBaseClass {

  public importantInfo?: string

  abstract setImportantDataFromOtherWorld(id: string, data: string): Promise<any>

  public getRandomData(): number {
    return Math.random()
  }

}

@decoratorPlayed
class ImportantClass extends ImportantBaseClass {

  private counter: number

  constructor() {
    super()
    this.counter = 0
  }

  public async setImportantDataFromOtherWorld(id: string, data: string): Promise<void> {
    console.log(`Hey, ${id} with data ${data} was set, importantInfo is ${this.importantInfo}!`)
    this.counter = this.counter + this.getRandomData()
    await new Promise((resolve) => setTimeout(() => resolve("This is the promise result"), 3000))
    return
  }

  public getCounter(): number {
    console.log("importantInfo is", this.importantInfo)
    return this.counter
  }
}

function decoratorPlayed(target: typeof ImportantBaseClass): void {
  for (const propertyName of Object.keys(target.prototype)) {
    const classPropertyOrMethod = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
    const isMethod = classPropertyOrMethod?.value instanceof Function;

    console.log(propertyName, "propertyName")

    if (!isMethod) {
      continue;
    }

    if (propertyName === "constructor") {
      continue;
    }

    const classMethod: PropertyDescriptor = classPropertyOrMethod
    const originalMethod: Function = classMethod?.value;
    let isMethodPromise = false

    try {
      isMethodPromise = isPromise(Object.getOwnPropertyDescriptor(target.prototype, propertyName)?.value())
    } catch (err) {
      isMethodPromise = false
    }

    if (isMethodPromise) {
      classMethod.value = async function (...args: any[]): Promise<any> {
        const value = "This is the promise result"
        const response = await new Promise<string>((resolve) => setTimeout(() => resolve(value), 3000))
        Object.defineProperty(this, "importantInfo", { value: response })
        return originalMethod.apply(this, args)
      }

      Object.defineProperty(target.prototype, propertyName, classMethod);
    }
  }
}

async function main() {
  console.log("Main started")
  const importantClass = new ImportantClass()
  console.log("importantInfo before setImportantDataFromOtherWorld:", importantClass.importantInfo)
  await importantClass.setImportantDataFromOtherWorld("298346293", "This is data")
  console.log("importantInfo after setImportantDataFromOtherWorld:", importantClass.importantInfo)
  importantClass.getCounter()
}

main()
