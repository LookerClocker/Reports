import React from 'react';

const ViewLinkReport = (props) => {
    return (
        <a href={'view_report/' + props.dependentValues}><button className="btn btn-default">View</button></a>
    )
};

export default ViewLinkReport;
