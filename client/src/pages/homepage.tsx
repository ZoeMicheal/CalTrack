import './homepage.css'
import NavBar from "../components/NavBar.tsx";
import {type CSSProperties, useState} from 'react'
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

//import './App.css'

// each page will have this similar format.

function HomePage() {

    const now = new Date();
    const date = now.toLocaleDateString( 'en-US',{
        weekday: 'long',
        day: 'numeric',
        month: 'short',
    })
    const [selecteddate,setselecteddate]=useState(now)
    function changeDate(amount:any){
        const copydate=new Date(selecteddate)
        copydate.setDate(copydate.getDate() +amount)
        setselecteddate(copydate)
    }
    const changingdate = selecteddate.toLocaleDateString('en-US',{
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
    const goal=1000;
    const consumed=866;
    const remaining = goal - consumed;
    const percentage = Math.round((consumed/goal)*100);

    const meallog = [
        {id: 1,mealtype:'Breakfast', calories:0},
        {id: 2, mealtype:'Lunch', calories:0},
        {id:3, mealtype:'Dinner', calories:0},
        {id: 4, mealtype:'Snacks', calories:0},
        {id: 5, mealtype:'Drinks', calories:0}

    ]
    return (
        <section className="HomePage">
            <div className="Dateheader">
                <p>{date}</p>
            </div>
            <div className="DashboardBubble">
                <div className="Percentbubble"><p>{percentage}%</p></div>
           <div className="Pie"
               style={{
                   '--percent': `${percentage}%`,
           } as CSSProperties}>
               <div className="Piehole">
               </div>

           </div>
            <div className="Statsrow">
                <div className="group">
                    <p>{consumed}</p>
                    <p>Consumed</p>
                </div>
                <div className="divider">
                </div>
                <div className="group">
                    <p>{remaining}</p>
                    <p>Remaining</p>
                </div>
            </div>
            </div>
            <div className="DateSwipe">
                <button className="swipebutton" onClick={()=>changeDate(-1)}><IoIosArrowBack />
                </button>
                <p className="Datetext">{changingdate}</p>
                <button className="swipebutton" onClick={()=>changeDate(1)}><IoIosArrowForward />
                </button>
            </div>
            <div className="Horizontaldivider"></div>

            <ul className="Meallog">
                {meallog.map((meallog) =>
                    <li className="MeallogTags" key={meallog.id}><p>{meallog.mealtype}</p>
                    <p>{meallog.calories} cal</p></li>)}

            </ul>
            <NavBar />
        </section>
    )
}

export default HomePage
