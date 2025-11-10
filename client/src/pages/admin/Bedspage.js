import { useEffect, useState } from "react";
import API from "./axiosConfig";

export default function BedsPage() {
  const [beds, setBeds] = useState([]);

  useEffect(() => {
    const loadBeds = async () => {
      const { data } = await API.get("/beds");
      setBeds(data);
    };
    loadBeds();
  }, []);

  return (
    <div>
      <h2>Bed Status</h2>
      <table>
        <thead>
          <tr><th>Bed</th><th>Status</th></tr>
        </thead>
        <tbody>
          {beds.map((b) => (
            <tr key={b._id}>
              <td>{b.name}</td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
