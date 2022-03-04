import axios from "axios"

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
    this.counter = this.counter + this.getRandomData()
    const { data: responseData }: any = await axios({
      method: 'get',
      url: 'https://api.github.com/orgs/facebook/repos',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    console.log(`importantInfo is ${this.importantInfo}! Fetched data is ${responseData[0].node_id}. Counter is ${this.counter}`)
    return
  }

  public getCounter(): number {
    console.log("importantInfo is", this.importantInfo)
    return this.counter
  }
}

function decoratorPlayed(target: typeof ImportantClass): void {
  for (const propertyName of Object.keys(Object.getOwnPropertyDescriptors(target.prototype))) {
    const classPropertyOrMethod = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
    const isMethod = classPropertyOrMethod?.value instanceof Function;

    if (!isMethod) {
      continue;
    }

    if (propertyName === "constructor") {
      continue;
    }

    const classMethod: PropertyDescriptor = classPropertyOrMethod
    const originalMethod: Function = classMethod?.value;
    const isMethodPromise = "AsyncFunction" === Object.getPrototypeOf(originalMethod).constructor.name.toString()

    if (isMethodPromise) {
      classMethod.value = async function (...args: any[]): Promise<any> {
        const { data: responseData }: any = await axios({
          method: 'get',
          url: 'https://api.github.com/orgs/facebook/repos',
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        })
        Object.defineProperty(this, "importantInfo", {
          value: responseData[0].node_id,
          writable: true,
          enumerable: true,
          configurable: true
        })
        const result = await originalMethod.apply(this, args)
        return result
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
