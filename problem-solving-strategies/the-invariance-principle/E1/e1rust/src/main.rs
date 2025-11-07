use bigdecimal::BigDecimal;
use std::str::FromStr;
use num_traits::Signed;

fn sqrtApproxx(mut a:BigDecimal, mut b :BigDecimal) -> Result<BigDecimal, String> {

    if a <= BigDecimal::from_str("0").unwrap() || b <= BigDecimal::from_str("0").unwrap() {
        return Err("Both a and b must be positive.".to_string());
    }

    if b>=a {
        return Err("Required 0 < b< a for convergence.".to_string());
    }

    let tol = BigDecimal::from_str("0.000000000001").unwrap();
    let two = BigDecimal::from_str("2").unwrap();


    for _ in 0..100000{
        let x_next : BigDecimal = (&a + &b)/&two;
        let y_next : BigDecimal = (&two* &a * &b)/(&a + &b);

        if (&x_next - &y_next).abs() < tol {
            return Ok((x_next+y_next)/&two);
        }

        a = x_next;
        b = y_next;
    }

    return Ok((&a + &b)/&two);
}

fn main() {
    println!("Hello, world!");
    let a = "2.0";
    let b = "1.00000";
    let adec = BigDecimal::from_str(&a).unwrap();
    let bdec = BigDecimal::from_str(&b).unwrap();

    println!("a({}) and b({}) with 10 decimals: is {} and {}", a, b, adec, bdec);

    // println!("Approximation of Sqrt ( {} * {} ) = {:?}", adec, bdec, sqrtApproxx(adec, bdec));
    match sqrtApproxx(adec.clone(), bdec.clone()){
        Ok(result) => println!("Approximation of Sqrt ( {} * {} ) = {} ", adec, bdec , result.with_scale(6)),
        Err(e) => println!("Error: {}", e),
    }
}
