import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {ROUTES} from "../constants/routes";
import userEvent from "@testing-library/user-event";
import {localStorageMock} from "../__mocks__/localStorage";
import firebase from "../__mocks__/firebase";
import DashboardUI from "../views/DashboardUI";

jest.mock("../app/Firestore");

describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {

    describe("When i choose a file to upload", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      let firestore = null
      const newBill = new NewBill({ document, onNavigate, firestore, localStorage: window.localStorage })
      const input = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      input.addEventListener('change', handleChangeFile)
      const falseAlert = jest.fn(newBill.alertExtension)

      it('should be loaded and handled, if it is in a correct format', async () => {
        const file = new File(['test file'], 'testFile.jpg', {type: 'image/jpg'})
        fireEvent.change(input, {target: {files: [file]}})
        await handleChangeFile
        expect(handleChangeFile).toHaveBeenCalled()
        expect(input.files[0]).toStrictEqual(file)
        expect(falseAlert).not.toHaveBeenCalled()
      })

      it('should not be loaded and should alert, if it is in a incorrect format', async () => {
        const file = new File(['test file'], 'testFile.txt', {type:'text/txt'})
        fireEvent.change(input, {target: {files: [file]}})
        await handleChangeFile
        expect(handleChangeFile).toHaveBeenCalled()
        expect(input.value).toBe('')
      })
    })
    describe('When i click on the submit button with the right input', () => {
      it('should submit my new bill and go back to bills page', () => {
        const html = NewBillUI()
        document.body.innerHTML = html
        const inputData = {
          type: 'Transports',
          name: 'test',
          amount: '100',
          date: '2020-12-01',
          vat: '10',
          pct: '20',
          commentary: 'ok',
          fileURL: 'thisURL',
          fileName: 'thisName',
        }
        const type = screen.getByTestId('expense-type')
        userEvent.selectOptions(type, screen.getAllByText('Transports'))
        expect(type.value).toBe(inputData.type)

        const name = screen.getByTestId('expense-name')
        fireEvent.change(name, {target: {value: inputData.name}})
        expect(name.value).toBe(inputData.name)

        const date = screen.getByTestId('datepicker')
        fireEvent.change(date, { target: {value: inputData.date} })
        expect(date.value).toBe(inputData.date)

        const vat = screen.getByTestId('vat')
        fireEvent.change(vat, { target: {value: inputData.vat} })
        expect(vat.value).toBe(inputData.vat)

        const pct = screen.getByTestId('pct')
        fireEvent.change(pct, { target: {value: inputData.pct} })
        expect(pct.value).toBe(inputData.pct)

        const comment = screen.getByTestId('commentary')
        fireEvent.change(comment, { target: { value: inputData.commentary } })
        expect(comment.value).toBe(inputData.commentary)

        const submitNewBill = screen.getByTestId('form-new-bill')
        Object.defineProperty(window, 'localStorage', { value: localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: 'johndoe@email.com'
        }))

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({pathname})
        }

        const PREVIOUS_LOCATION = ''

        const firestore = null
        const newBill = new NewBill({ document, onNavigate, firestore, localStorage: window.localStorage })

        const handleSubmit = jest.fn(newBill.handleSubmit)
        submitNewBill.addEventListener('submit', handleSubmit)

        fireEvent.submit(submitNewBill)
        expect(handleSubmit).toHaveBeenCalled()
        expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
      })
    })
  })
})

  //POST integration test
  describe("Given I am a user connected as Employee", () => {

    describe("When I create a new bill", () => {

      test("Add bill to mock API POST", async () => {
        const getSpyPost = jest.spyOn(firebase, "post")
        const newBill = {
          id: "eoKIpYhECmaZAGRrHjaC",
          status: "refused",
          pct: 10,
          amount: 500,
          email: "john@doe.com",
          name: "Facture 236",
          vat: "60",
          fileName: "preview-facture-free-201903-pdf-1.jpg",
          date: "2021-03-13",
          commentAdmin: "à valider",
          commentary: "A déduire",
          type: "Restaurants et bars",
          fileUrl: "https://saving.com",
        }
        const bills = await firebase.post(newBill)
        expect(getSpyPost).toHaveBeenCalledTimes(1)
        expect(bills.data.length).toBe(5)
      });

      test("Add bill to API and fails with 404 message error", async () => {
        firebase.post.mockImplementationOnce(() =>
            Promise.reject(new Error("Erreur 404"))
        );
        const html = BillsUI({error: "Erreur 404"})
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      });

      test("Add bill to API and fails with 500 message error", async () => {
        firebase.post.mockImplementationOnce(() =>
            Promise.reject(new Error("Erreur 404"))
        );
        const html = BillsUI({error: "Erreur 500"})
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
