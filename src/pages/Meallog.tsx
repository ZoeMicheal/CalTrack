import NavBar from '../components/NavBar';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import './Meallog.css';
import {useState} from "react";

function Meallog() {

    const now = new Date();
    const [selecteddate, setselecteddate] = useState(now);
    function changeDate(amount: any) {
        const copydate = new Date(selecteddate);
        copydate.setDate(copydate.getDate() + amount);
        setselecteddate(copydate);
    }
    const changingdate = selecteddate.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const meals = [
        {id:1, label: 'Food name', placeholder:'Eg: Protein Shake', type:'text'},
        {id:2, label: 'Calories (kcal)', placeholder:'Eg: 250', type:'number'},
        {id:3, label: 'Protein (g)', placeholder:'Eg: 23g', type:'number'},
        {id:4, label: 'Carbs (g)', placeholder:'Eg: 21g', type:'number'},
        {id:5, label: 'Fat (g)', placeholder:'Eg: 8g', type:'number'},
        {id:6, label: 'Fiber (g)', placeholder:'Eg: 5g', type:'number'},
        {id:7, label: 'Serving (g)', placeholder:'Eg: 400g', type:'number'},
    ]

    return (
        <section className="Meallogpage">
            <div className="Meallogheader"> Edit Meal</div>
     <div className="DateSwipe">
        <button className="swipebutton" onClick={() => changeDate(-1)}>
            <IoIosArrowBack />
        </button>
        <p className="Datetext">{changingdate}</p>
        <button className="swipebutton" onClick={() => changeDate(1)}>
            <IoIosArrowForward />
        </button>
    </div>
                <select className="Mealtype">
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snacks</option>
                    <option>Drink</option>

                </select>
            <div className="Logbubble">
   <ul className="Bubblecontent">
       {meals.map(meal => (
           <li className="Formrow" key={meal.id}>
               <label className="Formlabel">{meal.label}</label>
               <input className="Forminput" placeholder={meal.placeholder} />
           </li>
       ))}
   </ul>
            </div>
            <button className="Savebutton">Save changes</button>
            <button className="Cancelbutton">Cancel</button>
            <button className="Deletebutton">Delete this meal</button>
            <NavBar onOpenMenu={() => {}} />
        </section>
    )
}

export default Meallog;
