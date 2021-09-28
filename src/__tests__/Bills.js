import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {localStorageMock} from "../__mocks__/localStorage";
import {ROUTES, ROUTES_PATH} from "../constants/routes";
import Router from "../app/Router";
import Bills from "../containers/Bills";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, 'localStorage', {value: localStorageMock});
      const user = JSON.stringify({type: 'employee'});
      window.localStorage.setItem('user', user)
      const pathname = ROUTES_PATH['bills'];
      Object.defineProperty(window, 'location', {value: {hash: pathname}})
      document.body.innerHTML = `<div id="root"></div>`
      Router()
      expect(screen.getByTestId('icon-window').classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe('when i click on the eye icon button', ()=> {
    test('then a modal should open', ()=> {
      const html = BillsUI({data: bills})
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
     const bills = new Bills({document, onNavigate, firestore: null, localStorage: window.localStorage})
      const icon1 = screen.getByTestId('icon-eye');
      const handleShowBill = jest.fn((e)=> bills.handleClickIconEye(icon1))
      icon1.addEventListener('click', handleShowBill)
      userEvent.click(icon1)
      expect(handleShowBill).toHaveBeenCalled

    })
  })

  describe('when i click on the make new Bill Button', ()=> {
    test('a new bill modal should open', ()=> {

    })
  })

})
